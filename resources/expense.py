from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.expense import ExpenseModel
from schemas.expense import ExpenseSchema
from marshmallow import ValidationError
import logging
from utils.helpers import calculate_balances, generate_balance_sheet
from flask import send_file

logger = logging.getLogger(__name__)
expense_schema = ExpenseSchema()

class ExpenseResource(Resource):
    @jwt_required()
    def post(self):
        try:
            expense_data = expense_schema.load(request.get_json())
        except ValidationError as err:
            logger.error(f"Validation error in ExpenseResource: {err.messages}")
            return {"message": "Validation error", "errors": err.messages}, 400

        user_id = get_jwt_identity()
        expense_data['payer_id'] = user_id
        if user_id not in expense_data['participants']:
            expense_data['participants'].append(user_id)

        try:
            expense = ExpenseModel(**expense_data)
            expense.save_to_db()
            logger.info(f"Expense added successfully by user {user_id}")
            return {"message": "Expense added successfully.", "expense": expense_schema.dump(expense)}, 201
        except Exception as e:
            logger.error(f"Error in ExpenseResource: {str(e)}")
            return {"message": "An error occurred adding the expense."}, 500

class ExpenseList(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        try:
            expenses = ExpenseModel.find_by_user(user_id)
            logger.info(f"Retrieved {len(expenses)} expenses for user {user_id}")
            return {"expenses": expense_schema.dump(expenses, many=True)}, 200
        except Exception as e:
            logger.error(f"Error in ExpenseList: {str(e)}")
            return {"message": "An error occurred retrieving the expenses."}, 500



class BalanceSheet(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        expenses = ExpenseModel.find_by_user(user_id)
        balances = calculate_balances(expenses)
        
        filename = generate_balance_sheet(balances)
        return send_file(filename, as_attachment=True)