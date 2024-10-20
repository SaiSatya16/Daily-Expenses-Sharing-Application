// File: static/vue/index.js

import router from "./router.js"
import Navbar from "./components/navbar.js"

// Create a global event bus
window.EventBus = new Vue();

// Vue.js configuration
Vue.config.productionTip = false;

// Create the Vue instance
new Vue({
  el: "#app",
  router,
  components: {
    Navbar,
  },
  data: {
    isAuthenticated: !!localStorage.getItem('token')
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = !!localStorage.getItem('token');
    }
  },
  created() {
    // Listen for login and logout events
    EventBus.$on('user-logged-in', () => {
      this.checkAuth();
    });
    EventBus.$on('user-logged-out', () => {
      this.checkAuth();
    });
  },
  template: `
    <div>
      <Navbar :is-authenticated="isAuthenticated" />
      <router-view @login="checkAuth" @logout="checkAuth"></router-view>
    </div>
  `,
});