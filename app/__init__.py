from flask import Flask
import logging
from config.db_config import DB_CONFIG
from app.routes import configure_routes

#Descomentar o codigo a baixo para não exibir todos os logs no terminal
# log = logging.getLogger('werkzeug')
# handler = logging.FileHandler('server.log')  
# log.addHandler(handler)
# log.setLevel(logging.INFO)

def create_app():
    app = Flask(__name__, 
                template_folder="../templates",
                static_folder="../static")
    app.secret_key = 'supersecretkey'

    configure_routes(app)

    return app
