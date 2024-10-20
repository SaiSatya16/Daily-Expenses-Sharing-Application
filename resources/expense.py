from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.expense import ExpenseModel
from models.user import UserModel
from schemas.expense import ExpenseSchema
from marshmallow import ValidationError
import logging
from extensions import mongo

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

        payer_email = UserModel.find_by_id(user_id).email
        
        if user_id not in expense_data['participants']:
            # user_email = UserModel.find_by_id(user_id).email
            expense_data['participants'] = expense_data['participants'] + [payer_email]
        
        if expense_data['split_method'] == 'percentage':
            current_user_percentage = expense_data['user_split_percentage']
            current_user_email = payer_email
            #add the payer's percentage to the split details
            expense_data['split_details'][current_user_email] = current_user_percentage
            expense_data.pop('user_split_percentage', None)
        
        if expense_data['split_method'] == 'exact':
            current_user_amount = expense_data['user_split_amount']
            current_user_email = payer_email
            #add the payer's amount to the split details
            expense_data['split_details'][current_user_email] = current_user_amount
            expense_data.pop('user_split_amount', None)



        
        #remove user_split_percentage from the expense data
            

        try:
            expense = ExpenseModel(**expense_data)
            expense.save_to_db()
            
            response_data = expense_schema.dump(expense)
            response_data['payer_id'] = str(response_data['payer_id'])
            
            logger.info(f"Expense added successfully by user {user_id}")
            return {"message": "Expense added successfully.", "expense": response_data}, 201
        except ValueError as ve:
            logger.error(f"Value error in ExpenseResource: {str(ve)}")
            return {"message": str(ve)}, 400
        except Exception as e:
            logger.error(f"Error in ExpenseResource: {str(e)}")
            return {"message": "An error occurred adding the expense."}, 500
    
    @jwt_required()
    def get(self, expense_id):
        try:
            expense = ExpenseModel.find_by_id(expense_id)
            if expense:
                return expense_schema.dump(expense), 200
            return {"message": "Expense not found"}, 404
        except Exception as e:
            logger.error(f"Error in ExpenseResource GET: {str(e)}")
            return {"message": "An error occurred retrieving the expense."}, 500


class ExpenseList(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        try:
            expenses = ExpenseModel.find_by_user(user_id)
            total = len(expenses)
            expenses = expenses[(page-1)*per_page: page*per_page]
            logger.info(f"Retrieved {len(expenses)} expenses for user {user_id}")
            try:
                serialized_expenses = expense_schema.dump(expenses, many=True)
                # Ensure payer is not in split_details for each expense
                for expense in serialized_expenses:
                    expense['split_details'] = {k: v for k, v in expense['split_details'].items() if k != user_id}
                    if expense['split_method'] == 'equal':
                        non_payer_participants = [p for p in expense['participants'] if p != user_id]
                        split_amount = expense['amount'] / len(non_payer_participants)
                        expense['split_details'] = {p: split_amount for p in non_payer_participants}
            except Exception as e:
                logger.error(f"Error serializing expenses: {str(e)}")
                return {"message": "An error occurred while processing the expenses."}, 500
            return {
                "expenses": serialized_expenses,
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": (total + per_page - 1) // per_page
            }, 200
        except Exception as e:
            logger.error(f"Error in ExpenseList: {str(e)}")
            return {"message": "An error occurred retrieving the expenses."}, 500



class OverallExpenseList(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = UserModel.find_by_id(user_id)
        if not user.is_admin:
            return {"message": "Access denied. Admin privileges required."}, 403
        
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        try:
            expenses = list(mongo.db.expenses.find().sort("date", -1))
            total = len(expenses)
            expenses = expenses[(page-1)*per_page: page*per_page]
            logger.info(f"Retrieved {len(expenses)} overall expenses")
            return {
                "expenses": expense_schema.dump(expenses, many=True),
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": (total + per_page - 1) // per_page
            }, 200
        except Exception as e:
            logger.error(f"Error in OverallExpenseList: {str(e)}")
            return {"message": "An error occurred retrieving the overall expenses."}, 500