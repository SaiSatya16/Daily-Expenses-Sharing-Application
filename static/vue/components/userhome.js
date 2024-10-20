// File: static/vue/components/userhome.js
import ExpenseForm from './ExpenseForm.js';
import ExpenseList from './ExpenseList.js';
import Dashboard from './Dashboard.js';
import BalanceSheet from './BalanceSheet.js';

const userhome = {
  components: {
    ExpenseForm,
    ExpenseList,
    Dashboard,
    BalanceSheet
  },
  data() {
    return {
      activeTab: 'dashboard'
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      EventBus.$emit('user-logged-out');
      this.$router.push('/userlogin');
    },
    refreshExpenses() {
      // Refresh dashboard data
      if (this.$refs.dashboard) {
        this.$refs.dashboard.fetchDashboardData();
      }
      
      // Refresh expense list if it's currently rendered
      if (this.$refs.expenseList) {
        this.$refs.expenseList.fetchExpenses();
      }
      
      // If we're not on the expense list tab, switch to it
      if (this.activeTab !== 'expenseList') {
        this.activeTab = 'expenseList';
      }
    }
  },
  template: `
    <div class="container mt-5">
      <h1 class="text-center mb-4">Welcome to Your Dashboard</h1>
      <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
          <button class="nav-link" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">Dashboard</button>
          <button class="nav-link" :class="{ active: activeTab === 'addExpense' }" @click="activeTab = 'addExpense'">Add Expense</button>
          <button class="nav-link" :class="{ active: activeTab === 'expenseList' }" @click="activeTab = 'expenseList'">Expense List</button>
          <button class="nav-link" :class="{ active: activeTab === 'balanceSheet' }" @click="activeTab = 'balanceSheet'">Balance Sheet</button>
        </div>
      </nav>
      <div class="tab-content mt-3">
        <div v-if="activeTab === 'dashboard'">
          <Dashboard ref="dashboard" />
        </div>
        <div v-if="activeTab === 'addExpense'">
          <ExpenseForm @expense-added="refreshExpenses" />
        </div>
        <div v-if="activeTab === 'expenseList'">
          <ExpenseList ref="expenseList" />
        </div>
        <div v-if="activeTab === 'balanceSheet'">
          <BalanceSheet />
        </div>
      </div>
      <button @click="logout" class="btn btn-danger mt-3">Logout</button>
    </div>
  `
};

export default userhome;