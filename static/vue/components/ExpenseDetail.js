// File: static/vue/components/ExpenseDetail.js
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
            <p class="card-text"><strong>Amount:</strong> {{ expense.amount.toFixed(2) }}</p>
            <p class="card-text"><strong>Date:</strong> {{ new Date(expense.date).toLocaleString() }}</p>
            <p class="card-text"><strong>Split Method:</strong> {{ expense.split_method }}</p>
            <p class="card-text"><strong>Participants:</strong> {{ expense.participants.join(', ') }}</p>
            <h6>Split Details:</h6>
            <ul class="list-group">
              <li v-for="(amount, participant) in expense.split_details" :key="participant" class="list-group-item d-flex justify-content-between align-items-center">
                {{ participant }}
                <span class="badge bg-primary rounded-pill">{{ amount.toFixed(2) }}</span>
              </li>
            </ul>
          </div>
        </div>
        <button @click="close" class="btn btn-secondary mt-3">Back to Expense List</button>
      </div>
    `
  };
  
  export default ExpenseDetail;