# Daily Expenses Sharing

Daily Expenses Sharing is a Flask-RESTful application that provides an API for managing shared expenses among users. It allows users to add expenses, split costs, and generate balance sheets. The application uses MongoDB Atlas as its database and incorporates JWT for authentication.

## Features

- User authentication using JWT
- Expense submission and management
- Multiple expense splitting methods (equal, exact amount, percentage)
- Balance sheet generation
- Dashboard with expense statistics and visualizations
- MongoDB Atlas integration for data storage
- Input validation using Marshmallow schemas
- Comprehensive error handling and logging
- Unit tests for all major functionalities
- Vue.js frontend for user interaction

### Application currently live at [Daily Expenses Sharing](http://satyaprojects.ap-south-1.elasticbeanstalk.com/daily-expenses-app)

### API Documentation available at [API Documentation](http://satyaprojects.ap-south-1.elasticbeanstalk.com/api/expense-app/docs/)

- Deployed on AWS Elastic Beanstalk and MongoDB Atlas cloud services.
- The application is secured with JWT tokens.
- Employed AWS CodePipeline for CI/CD pipeline to deploy the application on AWS Elastic Beanstalk connected to the GitHub repository.

## Screenshots

### Home Page
![Home Page](screenshots/s1.png)

### API Documentation page
![API Documentation](screenshots/s2.png)

### User Dashboard
![User Dashboard](screenshots/s3.png)

### Add Expense Form
![Add Expense Form](screenshots/s4.png)

### Expense Details
![Expense Details](screenshots/s5.png)

## Prerequisites

- Python 3.7+
- MongoDB Atlas account
- Git (for cloning the repository)

## Setup

1. Clone this repository:

```bash
git clone https://github.com/yourusername/daily-expenses-sharing.git
cd daily-expenses-sharing
```

- you can setup the application locally or using Docker
- follow the below steps for local setup or docker setup

### Local Setup

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:

- currently, database is hosted on MongoDB Atlas, so you can skip this step and go ahead with the next step to run the application on my database which is already hosted on MongoDB Atlas
- If you want to host the database on your own, then follow the below steps:
  - Create a MongoDB Atlas account and set up a new cluster.
  - Create a `.env` file in the project root with the following contents:

```bash
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/daily_expenses_app
JWT_SECRET_KEY=your-secret-key
FLASK_DEBUG=False
```
Replace `<username>`, `<password>`, and `<cluster-name>` with your actual MongoDB Atlas credentials.

5. Ensure your IP address is whitelisted in MongoDB Atlas.

6. Run the application:
```bash
python app.py
```

## Docker Setup

1. Build and start the Docker containers:

```bash

docker compose up --build

```

5. The application will be available at http://localhost:5000

To stop the application, use:

```bash

docker compose down

```




## Project Structure

```bash
daily-expenses-sharing/
├── models/
│   ├── __init__.py
│   ├── balance_sheet.py
│   ├── expense.py
│   └── user.py
├── resources/
│   ├── __init__.py
│   ├── balance_sheet.py
│   ├── dashboard.py
│   ├── expense.py
│   └── user.py
├── schemas/
│   ├── __init__.py
│   ├── expense.py
│   └── user.py
├── static/
│   ├── css/
│   │   └── global.css
│   ├── openapi.json
│   └── vue/
│       ├── components/
│       │   ├── BalanceSheet.js
│       │   ├── Dashboard.js
│       │   ├── ExpenseDetail.js
│       │   ├── ExpenseForm.js
│       │   ├── ExpenseList.js
│       │   ├── UserRegister.js
│       │   ├── about.js
│       │   ├── home.js
│       │   ├── navbar.js
│       │   ├── userhome.js
│       │   └── userlogin.js
│       ├── index.js
│       └── router.js
├── templates/
│   └── index.html
├── tests/
│   └── test_app.py
├── utils/
│   ├── error_handlers.py
│   └── helpers.py
├── .env
├── .gitignore
├── app.py
├── config.py
├── extensions.py
└── requirements.txt
```

## API Endpoints

### User Endpoints

- `POST /register`: Register a new user
  - Body: `{"email": "string", "name": "string", "mobile": "string", "password": "string"}`

- `POST /login`: User login
  - Body: `{"email": "string", "password": "string"}`

- `GET /user/<string:user_id>`: Get user details (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`

### Expense Endpoints

- `POST /expense`: Add a new expense (requires authentication)
  - Body: `{"amount": number, "description": "string", "participants": ["string"], "split_method": "string", "split_details": {}, "user_split_percentage": number, "user_split_amount": number}`
  - Headers: `Authorization: Bearer <access_token>`

- `GET /expense/<string:expense_id>`: Get expense details (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`

- `GET /expenses`: Get user expenses (requires authentication)
  - Query Parameters: `page` (default: 1), `per_page` (default: 10)
  - Headers: `Authorization: Bearer <access_token>`

- `GET /overall-expenses`: Get overall expenses (admin only, requires authentication)
  - Query Parameters: `page` (default: 1), `per_page` (default: 10)
  - Headers: `Authorization: Bearer <access_token>`

### Balance Sheet Endpoints

- `GET /balance-sheet`: Get user balance sheet (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`

- `GET /overall-balance-sheet`: Get overall balance sheet (admin only, requires authentication)
  - Headers: `Authorization: Bearer <access_token>`

### Dashboard Endpoint

- `GET /dashboard`: Get user dashboard data (requires authentication)
  - Headers: `Authorization: Bearer <access_token>`

## Running Tests

To run the unit tests:

1. Ensure you're in the project root directory and your virtual environment is activated.

2. Run the following command:
```bash
python -m unittest tests/test_app.py
```

This will run all the unit tests and display the results in the console.

## Logging

The application logs are stored in `app.log` in the root directory. The log file is rotated when it reaches a certain size, keeping a maximum number of backup files.

## Troubleshooting

If you're having trouble connecting to MongoDB Atlas:

1. Double-check your `.env` file. Make sure your `MONGO_URI` is correctly formatted and all placeholders are replaced with your actual MongoDB Atlas credentials.
2. Ensure your IP address is whitelisted in MongoDB Atlas.
3. Check that your database user has the correct permissions.
4. Verify that your cluster is fully deployed and running in the Atlas dashboard.
5. If you're still having issues, check the `app.log` file for more detailed error messages.

## Security Considerations

- JWT tokens expire after 1 hour. For longer sessions, implement a refresh token mechanism.
- All passwords are hashed before being stored in the database.
- Sensitive information is stored in environment variables, not in the code.
- Input validation is performed on all user inputs to prevent injection attacks.


