// File: static/vue/components/userlogin.js

const UserLogin = {
  data() {
    return {
      email: '',
      password: '',
      error: ''
    };
  },
  methods: {
    async login() {
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('token', data.access_token);
          EventBus.$emit('user-logged-in');
          this.$router.push('/userhome');
        } else {
          this.error = data.message || 'Invalid credentials';
        }
      } catch (error) {
        this.error = 'An error occurred. Please try again.';
      }
    }
  },
  template: `
  <div class="container mt-5">
    <h2 class="text-center mb-4">User Login</h2>
    <div class="row justify-content-center">
      <div class="col-md-6">
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" class="form-control" id="email" v-model="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" class="form-control" id="password" v-model="password" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block mt-3">Login</button>
        </form>
        <p v-if="error" class="text-danger mt-3">{{ error }}</p>
        <p class="mt-3 text-center">
          Don't have an account? <router-link to="/user-register">Register as new user</router-link>
        </p>
      </div>
    </div>
  </div>
  `
};

export default UserLogin;