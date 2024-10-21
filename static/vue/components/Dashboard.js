const Dashboard = {
  data() {
    return {
      totalExpenses: 0,
      ownedAmount: 0,
      owedAmount: 0,
      recentExpenses: [],
      expenseHistory: [],
      error: '',
      chart: null
    };
  },
  methods: {
    async fetchDashboardData() {
      try {
        const response = await fetch('/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          this.totalExpenses = data.total_expenses;
          this.ownedAmount = data.owned_amount;
          this.owedAmount = data.owed_amount;
          this.recentExpenses = data.recent_expenses;
          this.expenseHistory = data.expense_history;
          this.$nextTick(() => this.renderChart());
        } else {
          this.error = data.message || 'An error occurred while fetching dashboard data.';
        }
      } catch (error) {
        this.error = 'An error occurred. Please try again.';
      }
    },
    renderChart() {
      const ctx = this.$refs.expenseChart.getContext('2d');
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.expenseHistory.map(entry => entry.date),
          datasets: [{
            label: 'Expense Amount',
            data: this.expenseHistory.map(entry => entry.amount),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  },
  mounted() {
    this.fetchDashboardData();
  },
  template: `
    <div class="container mt-5">
      <h2 class="text-center mb-4">Dashboard</h2>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="row row-cols-1 row-cols-md-3 g-4 mb-4">
        <div class="col">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Total Expenses</h5>
              <p class="card-text">{{ totalExpenses.toFixed(2) }}</p>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">You Owe</h5>
              <p class="card-text">{{ ownedAmount.toFixed(2) }}</p>
            </div>
          </div>
        </div>
        <div class="col">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">You Are Owed</h5>
              <p class="card-text">{{ owedAmount.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <h3>Recent Expenses</h3>
        <ul class="list-group">
          <li v-for="expense in recentExpenses" :key="expense._id" class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
            <span class="me-auto">{{ expense.description }}</span>
            <span class="badge bg-primary rounded-pill">{{ expense.amount.toFixed(2) }}</span>
          </li>
        </ul>
      </div>
      <div>
        <h3>Expense History</h3>
        <div style="height: 300px;">
          <canvas ref="expenseChart"></canvas>
        </div>
      </div>
    </div>
  `,
  style: `
    <style>
    @media (max-width: 767px) {
      .card-title {
        font-size: 1rem;
      }
      .card-text {
        font-size: 0.9rem;
      }
      .list-group-item {
        font-size: 0.9rem;
      }
    }
    </style>
  `
};

export default Dashboard;