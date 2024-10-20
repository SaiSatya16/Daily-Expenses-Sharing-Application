from flask import Flask, render_template
from flask_restful import Api
from flask_jwt_extended import JWTManager
from resources.user import UserRegister, UserLogin, UserResource
from resources.expense import ExpenseResource, ExpenseList, OverallExpenseList
from resources.balance_sheet import BalanceSheetResource, OverallBalanceSheetResource
from resources.dashboard import DashboardResource 
from extensions import mongo, bcrypt
from config import Config , DevelopmentConfig
from utils.error_handlers import register_error_handlers
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint

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
    api.add_resource(ExpenseResource, '/expense', '/expense/<string:expense_id>') 
    api.add_resource(ExpenseList, '/expenses')
    api.add_resource(OverallExpenseList, '/overall-expenses')
    api.add_resource(BalanceSheetResource, '/balance-sheet')
    api.add_resource(OverallBalanceSheetResource, '/overall-balance-sheet')
    api.add_resource(DashboardResource, '/dashboard')

    # Register error handlers
    register_error_handlers(app)

    return app

app = create_app(DevelopmentConfig)
app.app_context().push()
CORS(app)
SWAGGER_URL = '/api/docs'  # URL for exposing Swagger UI (without trailing '/')
API_URL = '/static/openapi.json' 
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,  # Swagger UI static files will be mapped to '{SWAGGER_URL}/dist/'
    API_URL,
    config={  # Swagger UI config overrides
        'app_name': "Test application"
    },
)

app.register_blueprint(swaggerui_blueprint)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)