// File: static/vue/components/navbar.js

const Navbar = {
    props: ['isAuthenticated'],
    data() {
      return {
        isNavbarOpen: false
      };
    },
    methods: {
      toggleNavbar() {
        this.isNavbarOpen = !this.isNavbarOpen;
      },
      logout() {
        localStorage.removeItem('token');
        EventBus.$emit('user-logged-out');
        this.$router.push('/');
      }
    },
    template: `
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
          <router-link class="navbar-brand" to="/">Daily Expenses Sharing</router-link>
          <button class="navbar-toggler" type="button" @click="toggleNavbar">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" :class="{ 'show': isNavbarOpen }">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <router-link class="nav-link" to="/" exact>Home</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/about">About</router-link>
              </li>
              <template v-if="isAuthenticated">
                <li class="nav-item">
                  <router-link class="nav-link" to="/userhome">Dashboard</router-link>
                </li>
                <li class="nav-item">
                  <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
                </li>
              </template>
              <template v-else>
                <li class="nav-item">
                  <router-link class="nav-link" to="/userlogin">Login</router-link>
                </li>
                <li class="nav-item">
                  <router-link class="nav-link" to="/user-register">Register</router-link>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </nav>
    `
  };
  
  export default Navbar;