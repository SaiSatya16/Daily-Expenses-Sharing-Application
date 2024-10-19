from extensions import mongo
from bson import ObjectId
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

class ExpenseModel:
    def __init__(self, payer_id, amount, description, participants, split_method, split_details, _id=None, date=None):
        self.payer_id = payer_id
        self.amount = amount
        self.description = description
        self.participants = participants
        self.split_method = split_method
        self.split_details = split_details
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

    def save_to_db(self):
        try:
            if not self._id:
                result = mongo.db.expenses.insert_one(self.json())
                self._id = result.inserted_id
                logger.info(f"New expense created with ID: {self._id}")
            else:
                mongo.db.expenses.update_one({"_id": self._id}, {"$set": self.json()})
                logger.info(f"Expense updated with ID: {self._id}")
        except Exception as e:
            logger.error(f"Error saving expense to database: {str(e)}")
            raise

    @classmethod
    def find_by_user(cls, user_id):
        try:
            expenses = list(mongo.db.expenses.find({"participants": user_id}))
            logger.info(f"Found {len(expenses)} expenses for user {user_id}")
            return [cls(**expense) for expense in expenses]
        except Exception as e:
            logger.error(f"Error finding expenses for user {user_id}: {str(e)}")
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