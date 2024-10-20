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
            payer_id = str(expense.payer_id)
            amount = expense.amount
            participants = expense.participants
            split_method = expense.split_method
            split_details = expense.split_details

            if split_method == 'equal':
                share = amount / len(participants)
                for participant in participants:
                    if participant != payer_id:
                        balances[participant] -= share
                        balances[payer_id] += share
            elif split_method in ['exact', 'percentage']:
                for participant, share in split_details.items():
                    if participant != payer_id:
                        balances[participant] -= share
                        balances[payer_id] += share

        return dict(balances)

    @staticmethod
    def generate_balance_sheet(user_id):
        balances = BalanceSheetModel.calculate_balances(user_id)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['User', 'Balance'])
        for email, balance in balances.items():
            # user = UserModel.find_by_email(email)
            writer.writerow([ email, f"{balance:.2f}"])
        return output.getvalue()

    @staticmethod
    def calculate_overall_balances():
        all_expenses = ExpenseModel.find_all()
        balances = defaultdict(float)

        for expense in all_expenses:
            payer_id = str(expense.payer_id)
            amount = expense.amount
            participants = expense.participants
            split_method = expense.split_method
            split_details = expense.split_details

            if split_method == 'equal':
                share = amount / len(participants)
                for participant in participants:
                    if participant != payer_id:
                        balances[participant] -= share
                        balances[payer_id] += share
            elif split_method in ['exact', 'percentage']:
                for participant, share in split_details.items():
                    if participant != payer_id:
                        balances[participant] -= share
                        balances[payer_id] += share

        return dict(balances)

    @staticmethod
    def generate_overall_balance_sheet():
        balances = BalanceSheetModel.calculate_overall_balances()
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['User', 'Balance'])
        for email, balance in balances.items():
            # user = UserModel.find_by_email(email)
            writer.writerow([email, f"{balance:.2f}"])
        return output.getvalue()