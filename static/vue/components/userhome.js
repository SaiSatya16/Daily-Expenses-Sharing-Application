// File: static/vue/components/userhome.js
import ExpenseForm from './ExpenseForm.js';
import ExpenseList from './ExpenseList.js';
import Dashboard from './Dashboard.js';
import BalanceSheet from './BalanceSheet.js';
import ExpenseDetail from './ExpenseDetail.js';

const userhome = {
  components: {
    ExpenseForm,
    ExpenseList,
    Dashboard,
    BalanceSheet,
    ExpenseDetail
  },
  data() {
    return {
      activeTab: 'dashboard',
      selectedExpenseId: null
    };
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      EventBus.$emit('user-logged-out');
      this.$router.push('/userlogin');
    },
    refreshExpenses() {
      if (this.$refs.dashboard) {
        this.$refs.dashboard.fetchDashboardData();
      }
      if (this.$refs.expenseList) {
        this.$refs.expenseList.fetchExpenses();
      }
      if (this.activeTab !== 'expenseList') {
        this.activeTab = 'expenseList';
      }
    },
    viewExpenseDetails(expenseId) {
      this.selectedExpenseId = expenseId;
      this.activeTab = 'expenseDetail';
    },
    closeExpenseDetails() {
      this.selectedExpenseId = null;
      this.activeTab = 'expenseList';
    }
  },
  template: `
    <div class="container mt-5">
      <h1 class="text-center mb-4">Welcome to Your Dashboard</h1>
      <div class="content-container">
        <ul class="nav nav-pills mb-4" id="pills-tab" role="tablist">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">Dashboard</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'addExpense' }" @click="activeTab = 'addExpense'">Add Expense</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'expenseList' }" @click="activeTab = 'expenseList'">Expense List</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: activeTab === 'balanceSheet' }" @click="activeTab = 'balanceSheet'">Balance Sheet</a>
          </li>
        </ul>
        <div class="tab-content mt-3">
          <div v-if="activeTab === 'dashboard'">
            <Dashboard ref="dashboard" />
          </div>
          <div v-if="activeTab === 'addExpense'">
            <ExpenseForm @expense-added="refreshExpenses" />
          </div>
          <div v-if="activeTab === 'expenseList'">
            <ExpenseList ref="expenseList" @view-expense="viewExpenseDetails" />
          </div>
          <div v-if="activeTab === 'balanceSheet'">
            <BalanceSheet />
          </div>
          <div v-if="activeTab === 'expenseDetail'">
            <ExpenseDetail :expenseId="selectedExpenseId" @close="closeExpenseDetails" />
          </div>
        </div>
      </div>
    </div>
  `
};

export default userhome;