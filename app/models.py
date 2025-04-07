#model.py

from app.db import conectar_bd
import os

def buscar_chamados_ativos():
    conexao = conectar_bd()
    cursor = conexao.cursor(dictionary=True)
    cursor.execute("SELECT * FROM chamados WHERE ativo = 'S'")
    chamados = cursor.fetchall()
    cursor.close()
    conexao.close()
    return chamados

def abrir_chamado(nome, contato, setor, descricao, arquivo_blob, arquivo_nome, arquivo_extensao, status):
    conexao = conectar_bd()
    cursor = conexao.cursor()

    cursor.execute('''
        INSERT INTO chamados (nome, contato, setor, descricao, arquivo, arquivo_nome, arquivo_extensao, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ''', (nome, contato, setor, descricao, arquivo_blob, arquivo_nome, arquivo_extensao, status))

    conexao.commit()
    chamado_id = cursor.lastrowid 

    cursor.close()
    conexao.close()
    return chamado_id


def excluir_chamado(id):
    conexao = conectar_bd()
    cursor = conexao.cursor()
    cursor.execute("UPDATE chamados SET ativo = 'N' WHERE id = %s", (id,))
    conexao.commit()
    cursor.close()
    conexao.close()


def resumo_chamados():
    conexao = conectar_bd()
    cursor = conexao.cursor(dictionary=True)

    consulta = """
        SELECT 
            COUNT(*) AS total_chamados,
            COALESCE(SUM(CASE WHEN DATE(data_criacao) = CURDATE() THEN 1 ELSE 0 END),0) AS chamados_hoje,
            COALESCE(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END),0) AS chamados_pendentes,
            COALESCE(SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END),0) AS chamados_em_andamento,
            COALESCE(SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END),0) AS chamados_concluidos
        FROM chamados;
    """

    cursor.execute(consulta)
    resultado = cursor.fetchone()

    cursor.close()
    conexao.close()
    
    return resultado

def buscar_chamado_por_id(id):
    conexao = conectar_bd()
    cursor = conexao.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM chamados 
        WHERE id = %s AND ativo = 'S'
    """, (id,))
    chamado = cursor.fetchone()
    cursor.close()
    conexao.close()
    return chamado

def atualizar_status_chamado(id, novo_status, conclusao=None):
    conexao = conectar_bd()
    cursor = conexao.cursor()
    
    if conclusao is not None:
        cursor.execute("""
            UPDATE chamados  
            SET status = %s, DESC_CONCLUSAO = %s
            WHERE id = %s
        """, (novo_status, conclusao, id))
    else:
        cursor.execute("""
            UPDATE chamados  
            SET status = %s
            WHERE id = %s
        """, (novo_status, id))
    
    conexao.commit()
    cursor.close()
    conexao.close()

def buscar_chamados_por_status(status):
    conexao = conectar_bd()
    cursor = conexao.cursor()
    cursor.execute("""
        SELECT * FROM chamados 
        WHERE status = %s AND ativo = 'S'
    """, (status,))
    chamados = cursor.fetchall()
    cursor.close()
    conexao.close()
    return chamados


def buscar_setores():
    conexao = conectar_bd()
    cursor = conexao.cursor()
    cursor.execute("SELECT DISTINCT setor FROM chamados WHERE ativo = 'S'")
    setores = cursor.fetchall()
    cursor.close()
    conexao.close()
    return [setor[0] for setor in setores] 

from datetime import datetime

def buscar_chamados_filtrados(data_inicio=None, data_fim=None, setor=None, tipo_data='abertura'):
    conexao = conectar_bd()
    cursor = conexao.cursor(dictionary=True)

    query = "SELECT * FROM chamados WHERE ativo = 'S'"
    
    filtros = []
    
    if data_inicio and data_fim:
        campo_data = 'data_criacao' if tipo_data == 'abertura' else 'data_conclusao'
        filtros.append(f"DATE({campo_data}) BETWEEN '{data_inicio}' AND '{data_fim}'")

    if setor:
        filtros.append(f"setor = '{setor}'")

    if filtros:
        query += " AND " + " AND ".join(filtros) 

    print(query)  
    cursor.execute(query)
    chamados = cursor.fetchall()

    chamados_serializaveis = []
    for chamado in chamados:
        chamado_dict = {}
        for key, value in chamado.items():
            if isinstance(value, bytes):
                try:
                    value = value.decode('utf-8')
                except UnicodeDecodeError:
                    try:
                        value = value.decode('latin1')
                    except UnicodeDecodeError:
                        value = str(value)
            chamado_dict[key] = value
        chamados_serializaveis.append(chamado_dict)

    cursor.close()
    conexao.close()

    return chamados_serializaveis
