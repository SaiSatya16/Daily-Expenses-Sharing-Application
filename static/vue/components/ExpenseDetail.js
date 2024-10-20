// File: static/vue/components/ExpenseDetail.js
const ExpenseDetail = {
    props: ['expenseId'],
    data() {
      return {
        expense: null,
        isEditing: false,
        editedExpense: {},
        error: '',
        success: ''
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
            this.editedExpense = { ...data };
          } else {
            this.error = data.message || 'An error occurred while fetching expense details.';
          }
        } catch (error) {
          this.error = 'An error occurred. Please try again.';
        }
      },
      async updateExpense() {
        try {
          const response = await fetch(`/expense/${this.expenseId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(this.editedExpense)
          });
          const data = await response.json();
          if (response.ok) {
            this.expense = { ...this.editedExpense };
            this.isEditing = false;
            this.success = 'Expense updated successfully.';
            this.error = '';
          } else {
            this.error = data.message || 'An error occurred while updating the expense.';
          }
        } catch (error) {
          this.error = 'An error occurred. Please try again.';
        }
      },
      cancelEdit() {
        this.editedExpense = { ...this.expense };
        this.isEditing = false;
      }
    },
    created() {
      this.fetchExpenseDetails();
    },
    template: `
      <div class="container mt-5">
        <h2 class="text-center mb-4">Expense Details</h2>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>
        <div v-if="expense">
          <form @submit.prevent="updateExpense" v-if="isEditing">
            <div class="form-group">
              <label for="amount">Amount:</label>
              <input type="number" class="form-control" id="amount" v-model="editedExpense.amount" required step="0.01">
            </div>
            <div class="form-group">
              <label for="description">Description:</label>
              <input type="text" class="form-control" id="description" v-model="editedExpense.description" required>
            </div>
            <div class="form-group">
              <label for="splitMethod">Split Method:</label>
              <select class="form-control" id="splitMethod" v-model="editedExpense.split_method" disabled>
                <option value="equal">Equal</option>
                <option value="exact">Exact Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Save Changes</button>
            <button type="button" class="btn btn-secondary mt-3 ml-2" @click="cancelEdit">Cancel</button>
          </form>
          <div v-else>
            <p><strong>Amount:</strong> {{ expense.amount.toFixed(2) }}</p>
            <p><strong>Description:</strong> {{ expense.description }}</p>
            <p><strong>Date:</strong> {{ new Date(expense.date).toLocaleString() }}</p>
            <p><strong>Split Method:</strong> {{ expense.split_method }}</p>
            <p><strong>Participants:</strong> {{ expense.participants.join(', ') }}</p>
            <h4 class="mt-4">Split Details:</h4>
            <ul class="list-group">
              <li v-for="(amount, participant) in expense.split_details" :key="participant" class="list-group-item d-flex justify-content-between align-items-center">
                {{ participant }}
                <span>{{ amount.toFixed(2) }}</span>
              </li>
            </ul>
            <button class="btn btn-primary mt-3" @click="isEditing = true">Edit Expense</button>
          </div>
        </div>
        <div v-else>Loading...</div>
      </div>
    `
  };
  
  export default ExpenseDetail;