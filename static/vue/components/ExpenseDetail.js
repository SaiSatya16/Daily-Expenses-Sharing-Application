const ExpenseDetail = {
  props: ['expenseId'],
  data() {
    return {
      expense: null,
      error: ''
    };
  },
  methods: {
    async fetchExpenseDetails() {
      try {
        const response = await fetch(`/expense/${this.expenseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          this.expense = data;
        } else {
          this.error = data.message || 'An error occurred while fetching expense details.';
        }
      } catch (error) {
        this.error = 'An error occurred. Please try again.';
      }
    },
    close() {
      this.$emit('close');
    }
  },
  created() {
    this.fetchExpenseDetails();
  },
  template: `
    <div class="container mt-5">
      <h2 class="text-center mb-4">Expense Details</h2>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="expense" class="card">
        <div class="card-body">
          <h5 class="card-title">{{ expense.description }}</h5>
          <div class="row">
            <div class="col-sm-6 mb-2">
              <strong>Amount:</strong> {{ expense.amount.toFixed(2) }}
            </div>
            <div class="col-sm-6 mb-2">
              <strong>Date:</strong> {{ new Date(expense.date).toLocaleString() }}
            </div>
          </div>
          <div class="row">
            <div class="col-sm-6 mb-2">
              <strong>Split Method:</strong> {{ expense.split_method }}
            </div>
            <div class="col-sm-6 mb-2">
              <strong>Participants:</strong> {{ expense.participants.join(', ') }}
            </div>
          </div>
          <h6 class="mt-3">Split Details:</h6>
          <ul class="list-group">
            <li v-for="(amount, participant) in expense.split_details" :key="participant" class="list-group-item d-flex justify-content-between align-items-center flex-wrap">
              <span class="me-auto">{{ participant }}</span>
              <span class="badge bg-primary rounded-pill">{{ amount.toFixed(2) }}</span>
            </li>
          </ul>
        </div>
      </div>
      <button @click="close" class="btn btn-secondary mt-3">Back to Expense List</button>
    </div>
  `,
  style: `
    <style>
    @media (max-width: 767px) {
      .card-title {
        font-size: 1.25rem;
      }
      .card-body {
        font-size: 0.9rem;
      }
      .list-group-item {
        font-size: 0.9rem;
      }
    }
    </style>
  `
};

export default ExpenseDetail;