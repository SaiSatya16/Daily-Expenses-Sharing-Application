from flask_restful import Resource
from flask import request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import UserModel
from schemas.user import UserSchema, UserLoginSchema
from marshmallow import ValidationError
import logging
from extensions import bcrypt
from bson import ObjectId, errors as bson_errors

logger = logging.getLogger(__name__)

user_schema = UserSchema()
user_login_schema = UserLoginSchema()

class UserRegister(Resource):
    def post(self):
        try:
            user_data = user_schema.load(request.get_json())
        except ValidationError as err:
            logger.error(f"Validation error in UserRegister: {err.messages}")
            return {"message": "Validation error", "errors": err.messages}, 400

        if UserModel.find_by_email(user_data['email']):
            logger.info(f"Attempted to register existing email: {user_data['email']}")
            return {"message": "A user with that email already exists"}, 400

        try:
            hashed_password = bcrypt.generate_password_hash(user_data['password']).decode('utf-8')
            user = UserModel(user_data['email'], user_data['name'], user_data['mobile'], hashed_password)
            user.save_to_db()
            logger.info(f"New user registered: {user_data['email']}")
            return {"message": "User created successfully."}, 201
        except Exception as e:
            logger.error(f"Error in UserRegister: {str(e)}")
            return {"message": "An error occurred creating the user."}, 500

class UserLogin(Resource):
    def post(self):
        try:
            user_data = user_login_schema.load(request.get_json())
        except ValidationError as err:
            logger.error(f"Validation error in UserLogin: {err.messages}")
            return {"message": "Validation error", "errors": err.messages}, 400

        user = UserModel.find_by_email(user_data['email'])

        if user and user.check_password(user_data['password']):
            access_token = create_access_token(identity=str(user._id))
            logger.info(f"User logged in: {user_data['email']}")
            return {'access_token': access_token}, 200
        
        logger.info(f"Failed login attempt for email: {user_data['email']}")
        return {'message': 'Invalid credentials'}, 401

class UserResource(Resource):
    @jwt_required()
    def get(self, user_id):
        try:
            user_id = ObjectId(user_id)
        except bson_errors.InvalidId:
            return {'message': 'Invalid user ID format'}, 400

        user = UserModel.find_by_id(user_id)
        if not user:
            return {'message': 'User not found'}, 404
        return user_schema.dump(user), 200