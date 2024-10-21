const ExpenseList = {
  data() {
    return {
      expenses: [],
      currentPage: 1,
      totalPages: 1,
      error: ''
    };
  },
  methods: {
    async fetchExpenses() {
      try {
        const response = await fetch(`/expenses?page=${this.currentPage}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          this.expenses = data.expenses;
          this.totalPages = data.pages;
        } else {
          this.error = data.message || 'An error occurred while fetching expenses.';
        }
      } catch (error) {
        this.error = 'An error occurred. Please try again.';
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchExpenses();
      }
    },
    viewExpenseDetails(expenseId) {
      this.$emit('view-expense', expenseId);
    }
  },
  created() {
    this.fetchExpenses();
  },
  template: `
    <div class="container mt-5">
      <h2 class="text-center mb-4">Your Expenses</h2>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th class="d-none d-md-table-cell">Split Method</th>
              <th class="d-none d-md-table-cell">Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="expense in expenses" :key="expense._id">
              <td>{{ new Date(expense.date).toLocaleDateString() }}</td>
              <td>{{ expense.description }}</td>
              <td>{{ expense.amount.toFixed(2) }}</td>
              <td class="d-none d-md-table-cell">{{ expense.split_method }}</td>
              <td class="d-none d-md-table-cell">{{ expense.participants.join(', ') }}</td>
              <td>
                <button class="btn btn-sm btn-info" @click="viewExpenseDetails(expense._id)">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav aria-label="Expense list pagination">
        <ul class="pagination justify-content-center flex-wrap">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
          </li>
          <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  `,
  styles: `
    <style>
    @media (max-width: 767px) {
      .table-responsive {
        font-size: 0.875rem;
      }
      .table th, .table td {
        padding: 0.5rem;
      }
      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }
    }
    </style>
  `
};

export default ExpenseList;