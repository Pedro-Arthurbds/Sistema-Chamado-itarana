#routes.py

from flask import Flask, render_template, request, redirect, flash, session, send_file, jsonify
from app.models import buscar_chamados_ativos, abrir_chamado, excluir_chamado, resumo_chamados, buscar_chamado_por_id, atualizar_status_chamado, buscar_chamados_filtrados, buscar_setores
from app.db import conectar_bd
import os
from io import BytesIO
from app.email_service import send_email
import mysql.connector


def configure_routes(app):

    @app.route('/')
    def home():
        chamados = buscar_chamados_ativos()
        return render_template('pages/abrir_chamado.html', chamados=chamados)

    EXTENSOES_PERMITIDAS = {'.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx'}

    @app.route('/abrir_chamado', methods=['POST'])
    def abrir_chamado_route():
        nome = request.form['nome']
        contato = request.form['contato']
        setor = request.form['setor']
        descricao = request.form['descricao']
        arquivo = request.files['arquivo']
        status = 1

        arquivo_blob = None
        arquivo_nome = None
        arquivo_extensao = None

        if arquivo and arquivo.filename:
            arquivo_nome, arquivo_extensao = os.path.splitext(arquivo.filename)
            arquivo_extensao = arquivo_extensao.lower()  

            if arquivo_extensao not in EXTENSOES_PERMITIDAS:
                # print('Tipo de arquivo não permitido. Envie apenas imagens, PDFs ou documentos do Word.')
                flash('Tipo de arquivo não permitido. Envie apenas imagens, PDFs ou documentos do Word.', 'danger')
                return redirect('/')

            arquivo_blob = arquivo.read()

        chamado_id = abrir_chamado(nome, contato, setor, descricao, arquivo_blob, arquivo_nome, arquivo_extensao, status)

        subject = f"Confirmação de Abertura de Chamado N°{chamado_id}"
        message = f"""
        Olá, {nome}!

        Seu chamado foi aberto com sucesso.

        **Detalhes do Chamado:**
        - Código: {chamado_id}
        - Setor: {setor}
        - Descrição: {descricao}

        Em breve, nossa equipe entrará em contato.

        Atenciosamente,  
        Equipe de Suporte
        """

        send_email(contato, subject, message)

        flash('Chamado aberto com sucesso! Um e-mail de confirmação foi enviado.', 'success')
        return redirect('/')


    @app.route('/excluir_chamado/<int:id>', methods=['POST'])
    def excluir_chamado_route(id):
        excluir_chamado(id)
        flash('Chamado excluído com sucesso!', 'success')
        return redirect('/')

    @app.route('/aplics/chamado/cadastro', methods=['GET', 'POST'])
    def cadastro():
        if request.method == 'POST':
            nome = request.form['nome']
            email = request.form['email']
            senha = request.form['senha']
            
            conexao = conectar_bd()
            cursor = conexao.cursor(dictionary=True)
            cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
            usuario_existente = cursor.fetchone()
            
            if usuario_existente:
                flash('Este e-mail já está cadastrado.', 'danger')
                cursor.close()
                conexao.close()
                return redirect('/cadastro')
            
            cursor.execute("INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)", (nome, email, senha))
            conexao.commit()
            cursor.close()
            conexao.close()
            
            flash('Cadastro realizado com sucesso!', 'success')
            return redirect('/login')
        
        return render_template('pages/cadastro_user.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            email = request.form['email']
            senha = request.form['senha']
            
            conexao = conectar_bd()
            cursor = conexao.cursor(dictionary=True)
            cursor.execute("SELECT * FROM usuarios WHERE email = %s AND senha = %s", (email, senha))
            usuario = cursor.fetchone()
            cursor.close()
            conexao.close()
            
            if usuario:
                session['usuario_id'] = usuario['id']  
                session['usuario_nome'] = usuario['nome'] 
                flash('Login realizado com sucesso!', 'success')
                return redirect('/')
            else:
                flash('E-mail ou senha incorretos.', 'danger')
                
        return render_template('pages/login.html')

    @app.route('/logout')
    def logout():
        session.clear()
        flash('Você foi desconectado com sucesso.', 'success')
        return redirect('/login')


    @app.route('/painel/adm', methods=['GET', 'POST'])
    def painel():
        resumos = resumo_chamados()
        chamados = buscar_chamados_filtrados()
        setores = buscar_setores()

        return render_template('pages/painel.html', resumos=resumos, chamados=chamados, setores=setores)


    @app.route('/chamado/<int:id>', methods=['GET', 'POST'])
    def detalhes_chamado(id):
        if request.method == 'POST':
            novo_status = int(request.form['status'])
            
            conclusao = request.form.get('conclusao')
            
            atualizar_status_chamado(id, novo_status, conclusao)
            
            if novo_status == 3:
                chamado = buscar_chamado_por_id(id)
                if chamado:
                    nome = chamado['nome']
                    contato = chamado['contato']
                    setor = chamado['setor']
                    descricao = chamado['descricao']
                    
                    subject = f"Finalização de Chamado #{id}"
                    message = f"""
                    Olá, {nome}!

                    Seu chamado foi concluído com sucesso.

                    **Detalhes do Chamado:**
                    - Código: {id}
                    - Setor: {setor}
                    - Descrição: {descricao}
                    - Conclusão: {conclusao}
                    
                    Qualquer problema futuro, estaremos à disposição.
                    Agradecemos por utilizar nosso sistema de chamados.
                    
                    Atenciosamente,  
                    Equipe de Suporte
                    """
                    
                    send_email(contato, subject, message)  

            flash('Status do chamado atualizado com sucesso!', 'success')
            return redirect(f'/chamado/{id}')
        
        chamado = buscar_chamado_por_id(id)
        if not chamado:
            flash('Chamado não encontrado!', 'danger')
            return redirect('/painel/adm')

        return render_template('pages/detalhes_chamado.html', chamado=chamado)


    @app.route('/download_anexo/<int:id>')
    def download_anexo(id):
        conexao = conectar_bd()
        cursor = conexao.cursor(dictionary=True)

        cursor.execute("""
            SELECT arquivo, arquivo_nome, arquivo_extensao 
            FROM chamados 
            WHERE id = %s AND arquivo IS NOT NULL
        """, (id,))
        
        resultado = cursor.fetchone()
        cursor.close()
        conexao.close()
        
        if resultado and resultado['arquivo']:
            arquivo_bytes = BytesIO(resultado['arquivo'])
            nome_arquivo = f"{resultado['arquivo_nome']}{resultado['arquivo_extensao']}"
            
            return send_file(
                arquivo_bytes,
                as_attachment=True,
                download_name=nome_arquivo,
                mimetype='application/octet-stream'
            )
        
        flash('Arquivo não encontrado!', 'danger')
        return redirect(f'/chamado/{id}')


    @app.route('/painel/adm/filtrar', methods=['POST'])
    def filtrar_chamados():
        try:
            data = request.get_json()  # Obtém os dados do JSON enviado pelo fetch
            data_inicio = data.get('data_inicio')
            data_fim = data.get('data_fim')
            setor = data.get('setor')
            tipo_data = data.get('tipo_data', 'abertura')

            chamados = buscar_chamados_filtrados(
                data_inicio=data_inicio,
                data_fim=data_fim,
                setor=setor,
                tipo_data=tipo_data
            )

            return jsonify(chamados)

        except mysql.connector.Error as e:
            return jsonify({'erro': f'Erro no banco de dados: {str(e)}'}), 500
        except Exception as e:
            return jsonify({'erro': f'Erro inesperado: {str(e)}'}), 400
