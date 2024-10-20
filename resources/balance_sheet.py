from flask_restful import Resource
from flask import send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.balance_sheet import BalanceSheetModel
from models.user import UserModel
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

class BalanceSheetResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        try:
            csv_data = BalanceSheetModel.generate_balance_sheet(user_id)
            buffer = BytesIO()
            buffer.write(csv_data.encode())
            buffer.seek(0)
            return send_file(
                buffer,
                as_attachment=True,
                download_name='balance_sheet.csv',
                mimetype='text/csv'
            )
        except Exception as e:
            logger.error(f"Error generating balance sheet for user {user_id}: {str(e)}")
            return {"message": "An error occurred generating the balance sheet."}, 500

class OverallBalanceSheetResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = UserModel.find_by_id(user_id)
        if not user.is_admin:
            return {"message": "Access denied. Admin privileges required."}, 403
        
        try:
            csv_data = BalanceSheetModel.generate_overall_balance_sheet()
            buffer = BytesIO()
            buffer.write(csv_data.encode())
            buffer.seek(0)
            return send_file(
                buffer,
                as_attachment=True,
                download_name='overall_balance_sheet.csv',
                mimetype='text/csv'
            )
        except Exception as e:
            logger.error(f"Error generating overall balance sheet: {str(e)}")
            return {"message": "An error occurred generating the overall balance sheet."}, 500