// File: static/vue/components/home.js

const home = {
    template: `
      <div class="container mt-5">
        <div class="jumbotron">
          <h1 class="display-4">Welcome to Daily Expenses Sharing</h1>
          <p class="lead">Simplify your shared expenses and keep track of who owes what.</p>
          <hr class="my-4">
          <p>Join our community today and start managing your shared expenses with ease!</p>
          <router-link to="/user-register" class="btn btn-primary btn-lg mr-2" role="button">Sign Up</router-link>
          <router-link to="/userlogin" class="btn btn-secondary btn-lg" role="button">Log In</router-link>
        </div>
  
        <div class="row mt-5">
          <div class="col-md-4">
            <h3>Track Expenses</h3>
            <p>Easily record and categorize your shared expenses.</p>
          </div>
          <div class="col-md-4">
            <h3>Split Costs</h3>
            <p>Automatically calculate how much each person owes.</p>
          </div>
          <div class="col-md-4">
            <h3>Settle Up</h3>
            <p>Keep track of balances and settle up with your friends.</p>
          </div>
        </div>
  
        <div class="mt-5">
          <h2>How It Works</h2>
          <ol>
            <li>Create an account or log in</li>
            <li>Add your expenses and specify how they should be split</li>
            <li>Invite your friends to join your expense groups</li>
            <li>View your balance sheet and settle up when ready</li>
          </ol>
        </div>
  
        <div class="mt-5">
          <h2>Why Choose Us?</h2>
          <ul>
            <li>User-friendly interface</li>
            <li>Multiple ways to split expenses (equal, exact amount, percentages)</li>
            <li>Detailed transaction history</li>
            <li>Secure and private</li>
          </ul>
        </div>
      </div>
    `
  };
  
  export default home;