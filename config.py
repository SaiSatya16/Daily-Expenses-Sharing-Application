import os
from dotenv import load_dotenv

load_dotenv()

class Config(object):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://satya1:Saisatya1610@clustersatyaproject1.i2sk1.mongodb.net/daily_expenses_app')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'thisissaltt1')
    FLASK_DEBUG = False
    PROPAGATE_EXCEPTIONS = True
    JWT_ACCESS_TOKEN_EXPIRES = 3600

class TestConfig(Config):
    TESTING = True
    MONGO_URI = os.getenv('MONGO_URI_TEST', 'mongodb+srv://satya1:Saisatya1610@clustersatyaproject1.i2sk1.mongodb.net/daily_expenses_app_test')
    JWT_SECRET_KEY = 'test_secret_key'
    FLASK_DEBUG = False
    PROPAGATE_EXCEPTIONS = True
    JWT_ACCESS_TOKEN_EXPIRES = 3600