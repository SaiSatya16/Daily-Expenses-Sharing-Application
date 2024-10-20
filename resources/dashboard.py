
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.expense import ExpenseModel
from models.user import UserModel
from datetime import datetime, timedelta

class DashboardResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = UserModel.find_by_id(user_id)

        if not user:
            return {"message": "User not found"}, 404

        # Calculate total expenses
        expenses = ExpenseModel.find_by_user(user_id)
        total_expenses = sum(expense.amount for expense in expenses)

        # Calculate owned and owed amounts
        owned_amount = 0
        owed_amount = 0
        for expense in expenses:
            if str(expense.payer_id) == user_id:
                owed_amount += expense.amount - expense.split_details.get(user_id, 0)
            else:
                owned_amount += expense.split_details.get(user_id, 0)

        # Get recent expenses (last 5)
        recent_expenses = [
            {
                "description": expense.description,
                "amount": expense.amount,
                "date": expense.date.isoformat()
            }
            for expense in sorted(expenses, key=lambda x: x.date, reverse=True)[:5]
        ]

        # Calculate expense history (last 30 days)
        today = datetime.now()
        thirty_days_ago = today - timedelta(days=30)
        expense_history = []
        for i in range(30):
            date = thirty_days_ago + timedelta(days=i)
            amount = sum(expense.amount for expense in expenses if expense.date.date() == date.date())
            expense_history.append({
                "date": date.strftime("%Y-%m-%d"),
                "amount": amount
            })

        return {
            "total_expenses": total_expenses,
            "owned_amount": owned_amount,
            "owed_amount": owed_amount,
            "recent_expenses": recent_expenses,
            "expense_history": expense_history
        }, 200

