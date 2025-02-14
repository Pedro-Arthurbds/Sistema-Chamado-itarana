import mysql.connector
from config.db_config import DB_CONFIG

def conectar_bd():
    return mysql.connector.connect(**DB_CONFIG)
