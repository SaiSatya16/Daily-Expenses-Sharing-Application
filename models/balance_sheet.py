from models.expense import ExpenseModel
from models.user import UserModel
from collections import defaultdict
import csv
from io import StringIO
from bson import ObjectId

class BalanceSheetModel:
    @staticmethod
    def calculate_balances(user_id):
        expenses = ExpenseModel.find_by_user(str(user_id))
        balances = defaultdict(float)

        for expense in expenses:
            splits = expense.calculate_splits()
            for participant, amount in splits.items():
                if participant == str(expense.payer_id):
                    balances[participant] += expense.amount - amount
                else:
                    balances[participant] -= amount

        return dict(balances)

    @staticmethod
    def generate_balance_sheet(user_id):
        balances = BalanceSheetModel.calculate_balances(user_id)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['User', 'Balance'])
        for user_id, balance in balances.items():
            user = UserModel.find_by_id(user_id)
            writer.writerow([user.name if user else user_id, f"{balance:.2f}"])
        return output.getvalue()

    @staticmethod
    def calculate_overall_balances():
        all_expenses = ExpenseModel.find_all()
        balances = defaultdict(float)

        for expense in all_expenses:
            splits = expense.calculate_splits()
            for participant, amount in splits.items():
                if participant == expense.payer_id:
                    balances[participant] += expense.amount - amount
                else:
                    balances[participant] -= amount

        return dict(balances)

    @staticmethod
    def generate_overall_balance_sheet():
        balances = BalanceSheetModel.calculate_overall_balances()
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['User', 'Balance'])
        for user_id, balance in balances.items():
            user = UserModel.find_by_id(user_id)
            writer.writerow([user.name, f"{balance:.2f}"])
        return output.getvalue()