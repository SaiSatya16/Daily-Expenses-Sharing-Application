from extensions import mongo
from bson import ObjectId
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class ExpenseModel:
    def __init__(self, payer_id, amount, description, participants, split_method, split_details=None, _id=None, date=None):
        self.payer_id = str(payer_id)
        self.amount = amount
        self.description = description
        self.participants = [str(p) for p in participants]
        # if self.payer_id not in self.participants:
        #     self.participants.append(self.payer_id)
        self.split_method = split_method
        self.split_details = split_details or {}
        self.date = self._parse_date(date) if date else datetime.now(timezone.utc)
        self._id = _id

    def _parse_date(self, date):
        if isinstance(date, datetime):
            return date
        elif isinstance(date, str):
            return datetime.fromisoformat(date)
        else:
            raise ValueError(f"Unsupported date format: {date}")

    def json(self):
        return {
            "_id": str(self._id) if self._id else None,
            "payer_id": self.payer_id,
            "amount": self.amount,
            "description": self.description,
            "participants": self.participants,
            "split_method": self.split_method,
            "split_details": self.split_details,
            "date": self.date.isoformat()
        }

    def calculate_splits(self):
        logger.debug(f"Calculating splits for expense: {self.json()}")
        if self.split_method == 'equal':
            return self._calculate_equal_split()
        elif self.split_method == 'exact':
            return self._calculate_exact_split()
        elif self.split_method == 'percentage':
            return self._calculate_percentage_split()
        else:
            raise ValueError(f"Invalid split method: {self.split_method}")

    def _calculate_equal_split(self):
        num_participants = len(self.participants)
        split_amount = self.amount / num_participants
        result = {participant: split_amount for participant in self.participants if participant != self.payer_id}
        logger.debug(f"Equal split calculation result: {result}")
        return result

    def _calculate_exact_split(self):
        total_split = sum(self.split_details.values())
        if abs(total_split - self.amount) > 0.01:  # Allow for small floating-point discrepancies
            raise ValueError("Sum of exact amounts does not match the total expense amount")
        result = {k: v for k, v in self.split_details.items() if k != self.payer_id}
        logger.debug(f"Exact split calculation result: {result}")
        return result

    def _calculate_percentage_split(self):
        total_percentage = sum(self.split_details.values())
        if abs(total_percentage - 100) > 0.01:  # Allow for small floating-point discrepancies
            raise ValueError("Sum of percentages does not equal 100%")
        result = {k: (v / 100) * self.amount for k, v in self.split_details.items() if k != self.payer_id}
        logger.debug(f"Percentage split calculation result: {result}")
        return result

    def save_to_db(self):
        try:
            self.split_details = self.calculate_splits()
            expense_data = self.json()
            if '_id' in expense_data:
                del expense_data['_id']  # Remove _id from the data to be inserted
            result = mongo.db.expenses.insert_one(expense_data)
            self._id = result.inserted_id
            logger.info(f"New expense created with ID: {self._id}")
        except Exception as e:
            logger.error(f"Error saving expense to database: {str(e)}")
            raise

    @classmethod
    def find_by_user(cls, payer_id):
        try:
            expenses_cursor = mongo.db.expenses.find({"payer_id": payer_id})
            expenses = list(expenses_cursor)
            logger.info(f"Found {len(expenses)} expenses for user {payer_id}")
            return [cls(**expense) for expense in expenses]
        except Exception as e:
            logger.error(f"Error finding expenses for user {payer_id}: {str(e)}")
            raise

    @classmethod
    def find_by_id(cls, expense_id):
        try:
            expense = mongo.db.expenses.find_one({"_id": ObjectId(expense_id)})
            logger.info(f"Found expense with ID: {expense_id}")
            return cls(**expense) if expense else None
        except Exception as e:
            logger.error(f"Error finding expense by ID {expense_id}: {str(e)}")
            raise