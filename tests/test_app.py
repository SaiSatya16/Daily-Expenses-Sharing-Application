import unittest
from app import create_app
from extensions import mongo
import json
from config import TestConfig
import jwt

class VerboseTestRunner(unittest.TextTestRunner):
    def __init__(self, stream=None, descriptions=True, verbosity=2, failfast=False, buffer=False, resultclass=None, warnings=None, *, tb_locals=False):
        super().__init__(stream, descriptions, verbosity, failfast, buffer, resultclass, warnings, tb_locals=tb_locals)

    def run(self, test):
        result = super().run(test)
        print("\nTest Summary:")
        print(f"Ran {result.testsRun} tests")
        print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
        print(f"Failures: {len(result.failures)}")
        print(f"Errors: {len(result.errors)}")
        return result

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

    def get_user_id_from_token(self, token):
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded['sub']

    def test_user_registration(self):
        response = self.client.post('/register', json={
            'email': 'test@example.com',
            'name': 'Test User',
            'mobile': '1234567890',
            'password': 'testpassword'
        })
        self.assertEqual(response.status_code, 201)
        self.assertIn('User created successfully', response.get_json()['message'])

    def test_user_login(self):
        self.client.post('/register', json={
            'email': 'test@example.com',
            'name': 'Test User',
            'mobile': '1234567890',
            'password': 'testpassword'
        })
        response = self.client.post('/login', json={
            'email': 'test@example.com',
            'password': 'testpassword'
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('access_token', data)
        return data['access_token']

    def test_add_expense_equal_split(self):
        access_token = self.test_user_login()
        response = self.client.post('/expense', 
            headers={'Authorization': f'Bearer {access_token}'},
            json={
                'amount': 3000,
                'description': 'Dinner',
                'participants': ['friend1@example.com', 'friend2@example.com'],
                'split_method': 'equal',
                'split_details': {}
            })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('Expense added successfully', data['message'])
        self.assertEqual(data['expense']['amount'], 3000)
        self.assertEqual(len(data['expense']['split_details']), 3)
        for participant, amount in data['expense']['split_details'].items():
            self.assertEqual(amount, 1000)  # Each participant should owe 1000

    def test_add_expense_exact_split(self):
        access_token = self.test_user_login()
        response = self.client.post('/expense', 
            headers={'Authorization': f'Bearer {access_token}'},
            json={
                'amount': 4299,
                'description': 'Shopping',
                'participants': ['friend1@example.com', 'friend2@example.com'],
                'split_method': 'exact',
                'split_details': {
                    'friend1@example.com': 799,
                    'friend2@example.com': 2000
                },
                'user_split_amount': 1500
            })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('Expense added successfully', data['message'])
        self.assertEqual(data['expense']['amount'], 4299)
        self.assertEqual(len(data['expense']['split_details']), 3)
        self.assertEqual(data['expense']['split_details'].get('friend1@example.com'), 799)
        self.assertEqual(data['expense']['split_details'].get('friend2@example.com'), 2000)

    def test_add_expense_percentage_split(self):
        access_token = self.test_user_login()
        response = self.client.post('/expense', 
            headers={'Authorization': f'Bearer {access_token}'},
            json={
                'amount': 1000,
                'description': 'Party',
                'participants': ['friend1@example.com', 'friend2@example.com'],
                'split_method': 'percentage',
                'split_details': {
                    'friend1@example.com': 25,
                    'friend2@example.com': 25
                },
                'user_split_percentage': 50
            })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn('Expense added successfully', data['message'])
        self.assertEqual(data['expense']['amount'], 1000)
        self.assertEqual(len(data['expense']['split_details']), 3)
        self.assertEqual(data['expense']['split_details'].get('friend1@example.com'), 250)
        self.assertEqual(data['expense']['split_details'].get('friend2@example.com'), 250)

    def test_get_expenses(self):
        access_token = self.test_user_login()
        self.client.post('/expense', 
            headers={'Authorization': f'Bearer {access_token}'},
            json={
                'amount': 100,
                'description': 'Test expense',
                'participants': ['friend1@example.com'],
                'split_method': 'equal',
                'split_details': {}
            })
        response = self.client.get('/expenses', 
            headers={'Authorization': f'Bearer {access_token}'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('expenses', data)
        self.assertEqual(len(data['expenses']), 1)
        self.assertEqual(data['expenses'][0]['description'], 'Test expense')

    def get_user_id_from_token(self, token):
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded['sub']

    @classmethod
    def get_access_token(cls):
        cls.client.post('/register', json={
            'email': 'test@example.com',
            'name': 'Test User',
            'mobile': '1234567890',
            'password': 'testpassword'
        })
        response = cls.client.post('/login', json={
            'email': 'test@example.com',
            'password': 'testpassword'
        })
        return response.get_json()['access_token']

if __name__ == '__main__':
    unittest.main(testRunner=VerboseTestRunner())