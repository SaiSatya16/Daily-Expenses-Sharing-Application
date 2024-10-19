import csv
from tempfile import NamedTemporaryFile
from collections import defaultdict

def calculate_balances(expenses):
    balances = defaultdict(float)
    
    for expense in expenses:
        payer_id = expense.payer_id
        amount = expense.amount
        split_method = expense.split_method
        split_details = expense.split_details
        participants = expense.participants

        if split_method == 'equal':
            share = amount / len(participants)
            for participant in participants:
                if participant != payer_id:
                    balances[participant] -= share
                    balances[payer_id] += share
        elif split_method in ['exact', 'percentage']:
            for participant, share in split_details.items():
                if split_method == 'percentage':
                    share = (share / 100) * amount
                if participant != payer_id:
                    balances[participant] -= share
                    balances[payer_id] += share

    return balances

def generate_balance_sheet(balances):
    temp_file = NamedTemporaryFile(mode='w+', delete=False, suffix='.csv', newline='')
    
    with temp_file as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['User', 'Balance'])
        for user_id, balance in balances.items():
            writer.writerow([user_id, f"{balance:.2f}"])

    return temp_file.name