from flask import Flask
from flask_restful import Api
from flask_jwt_extended import JWTManager
from resources.user import UserRegister, UserLogin, UserResource
from resources.expense import ExpenseResource, ExpenseList, OverallExpenseList
from resources.balance_sheet import BalanceSheetResource, OverallBalanceSheetResource
from extensions import mongo, bcrypt
from config import Config
from utils.error_handlers import register_error_handlers
from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    mongo.init_app(app)
    bcrypt.init_app(app)
    JWTManager(app)

    # Initialize API
    api = Api(app)

    # Add resources
    api.add_resource(UserRegister, '/register')
    api.add_resource(UserLogin, '/login')
    api.add_resource(UserResource, '/user/<string:user_id>')
    api.add_resource(ExpenseResource, '/expense')
    api.add_resource(ExpenseList, '/expenses')
    api.add_resource(OverallExpenseList, '/overall-expenses')
    api.add_resource(BalanceSheetResource, '/balance-sheet')
    api.add_resource(OverallBalanceSheetResource, '/overall-balance-sheet')

    # Register error handlers
    register_error_handlers(app)

    # Enable CORS
    CORS(app)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)