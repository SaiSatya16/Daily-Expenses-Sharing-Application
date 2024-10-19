import unittest
from app import create_app
from extensions import mongo
import json
from config import TestConfig
import jwt

class TestApp(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app(TestConfig)
        cls.client = cls.app.test_client()
        
        with cls.app.app_context():
            mongo.init_app(cls.app)

    def setUp(self):
        with self.app.app_context():
            mongo.db.users.delete_many({})
            mongo.db.expenses.delete_many({})

    @classmethod
    def tearDownClass(cls):
        with cls.app.app_context():
            mongo.cx.close()

    def test_user_registration(self):
        response = self.client.post('/register', json={
            'email': 'test@example.com',
            'name': 'Test User',
            'mobile': '1234567890',
            'password': 'testpassword'
        })
        print(f"Registration response: {response.get_json()}")
        self.assertEqual(response.status_code, 201)
        self.assertIn('User created successfully', response.get_json()['message'])

    def test_user_login(self):
        # First, register a user
        self.client.post('/register', json={
            'email': 'test@example.com',
            'name': 'Test User',
            'mobile': '1234567890',
            'password': 'testpassword'
        })

        # Then, try to login
        response = self.client.post('/login', json={
            'email': 'test@example.com',
            'password': 'testpassword'
        })
        print(f"Login response status: {response.status_code}")
        print(f"Login response data: {response.get_json()}")
        
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('access_token', data)
        return data['access_token']

    def test_add_expense(self):
        access_token = self.test_user_login()

        # Add an expense
        response = self.client.post('/expense', 
            headers={'Authorization': f'Bearer {access_token}'},
            json={
                'amount': 100,
                'description': 'Test expense',
                'participants': ['test@example.com'],
                'split_method': 'equal',
                'split_details': {}
            })
        self.assertEqual(response.status_code, 201)
        self.assertIn('Expense added successfully', response.get_json()['message'])

    def test_get_expenses(self):
        access_token = self.test_user_login()
        user_id = self.get_user_id_from_token(access_token)

        # Add an expense
        add_expense_response = self.client.post('/expense', 
            headers={'Authorization': f'Bearer {access_token}'},
            json={
                'amount': 100,
                'description': 'Test expense',
                'participants': [user_id],
                'split_method': 'equal',
                'split_details': {}
            })
        print(f"Add expense response: {add_expense_response.status_code}")
        print(f"Add expense data: {add_expense_response.get_json()}")

        # Get expenses
        get_expenses_response = self.client.get('/expenses', 
            headers={'Authorization': f'Bearer {access_token}'})
        print(f"Get expenses response: {get_expenses_response.status_code}")
        print(f"Get expenses data: {get_expenses_response.get_json()}")

        self.assertEqual(get_expenses_response.status_code, 200)
        data = get_expenses_response.get_json()
        self.assertIn('expenses', data)
        self.assertEqual(len(data['expenses']), 1)
        self.assertEqual(data['expenses'][0]['description'], 'Test expense')

    def get_user_id_from_token(self, token):
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded['sub']

if __name__ == '__main__':
    unittest.main()