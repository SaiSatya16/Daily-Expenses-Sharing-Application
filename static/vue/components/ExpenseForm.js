const ExpenseForm = {
  data() {
    return {
      amount: '',
      description: '',
      participants: [],
      newParticipant: '',
      splitMethod: 'equal',
      splitDetails: {},
      userSplitPercentage: '',
      userSplitAmount: '',
      error: '',
      success: ''
    };
  },
  methods: {
    async addExpense() {
      if (!this.validateForm()) {
        return;
      }
      try {
        const expenseData = {
          amount: parseFloat(this.amount),
          description: this.description,
          participants: this.participants,
          split_method: this.splitMethod,
          split_details: this.splitDetails
        };

        if (this.splitMethod === 'percentage') {
          expenseData.user_split_percentage = parseFloat(this.userSplitPercentage);
        } else if (this.splitMethod === 'exact') {
          expenseData.user_split_amount = parseFloat(this.userSplitAmount);
        }

        const response = await fetch('/expense', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(expenseData),
        });
        const data = await response.json();
        if (response.ok) {
          this.success = "Expense added successfully.";
          this.error = '';
          this.resetForm();
          this.$emit('expense-added');
        } else {
          this.error = data.message || 'An error occurred while adding the expense.';
        }
      } catch (error) {
        this.error = 'An error occurred. Please try again.';
      }
    },
    resetForm() {
      this.amount = '';
      this.description = '';
      this.participants = [];
      this.newParticipant = '';
      this.splitMethod = 'equal';
      this.splitDetails = {};
      this.userSplitPercentage = '';
      this.userSplitAmount = '';
    },
    addParticipant() {
      if (this.newParticipant && !this.participants.includes(this.newParticipant)) {
        this.participants.push(this.newParticipant);
        this.newParticipant = '';
        this.updateSplitDetails();
      }
    },
    removeParticipant(participant) {
      this.participants = this.participants.filter(p => p !== participant);
      this.updateSplitDetails();
    },
    updateSplitDetails() {
      if (this.splitMethod === 'equal') {
        this.splitDetails = {};
        this.userSplitPercentage = '';
        this.userSplitAmount = '';
      } else {
        const newSplitDetails = {};
        this.participants.forEach(participant => {
          newSplitDetails[participant] = this.splitDetails[participant] || '';
        });
        this.splitDetails = newSplitDetails;
        if (this.splitMethod === 'percentage' && this.userSplitPercentage === '') {
          this.userSplitPercentage = '0';
        } else if (this.splitMethod === 'exact' && this.userSplitAmount === '') {
          this.userSplitAmount = '0';
        }
      }
    },
    validateForm() {
      this.error = '';
      if (!this.amount || isNaN(this.amount) || this.amount <= 0) {
        this.error = 'Please enter a valid amount.';
        return false;
      }
      if (!this.description.trim()) {
        this.error = 'Please enter a description.';
        return false;
      }
      if (this.participants.length < 1) {
        this.error = 'Please add at least one participant.';
        return false;
      }
      if (this.splitMethod !== 'equal') {
        const totalSplit = Object.values(this.splitDetails).reduce((sum, val) => sum + parseFloat(val || 0), 0);
        if (this.splitMethod === 'exact') {
          const totalWithUser = totalSplit + parseFloat(this.userSplitAmount || 0);
          if (Math.abs(totalWithUser - parseFloat(this.amount)) > 0.01) {
            this.error = 'The sum of split amounts, including yours, must equal the total expense amount.';
            return false;
          }
        }
        if (this.splitMethod === 'percentage') {
          const totalWithUser = totalSplit + parseFloat(this.userSplitPercentage || 0);
          if (Math.abs(totalWithUser - 100) > 0.01) {
            this.error = 'The sum of all percentages, including yours, must equal 100%.';
            return false;
          }
        }
      }
      return true;
    }
  },
  watch: {
    splitMethod() {
      this.updateSplitDetails();
    }
  },
  template: `
    <div class="container mt-5">
      <h2 class="text-center mb-4">Add New Expense</h2>
      <form @submit.prevent="addExpense" class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="amount" class="form-label">Amount:</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control" id="amount" v-model="amount" required step="0.01" min="0.01">
          </div>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label">Description:</label>
          <input type="text" class="form-control" id="description" v-model="description" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Participants:</label>
          <div class="input-group mb-2">
            <input type="text" class="form-control" v-model="newParticipant" placeholder="Enter participant email">
            <button class="btn btn-outline-secondary" type="button" @click="addParticipant">Add</button>
          </div>
          <ul class="list-group">
            <li v-for="participant in participants" :key="participant" class="list-group-item d-flex justify-content-between align-items-center">
              <span class="text-break">{{ participant }}</span>
              <button type="button" class="btn btn-danger btn-sm" @click="removeParticipant(participant)">Remove</button>
            </li>
          </ul>
        </div>
        <div class="mb-3">
          <label for="splitMethod" class="form-label">Split Method:</label>
          <select class="form-select" id="splitMethod" v-model="splitMethod">
            <option value="equal">Equal</option>
            <option value="exact">Exact Amount</option>
            <option value="percentage">Percentage</option>
          </select>
        </div>
        <div v-if="splitMethod === 'percentage'" class="mb-3">
          <label for="userSplitPercentage" class="form-label">Your Split Percentage:</label>
          <div class="input-group">
            <input type="number" class="form-control" id="userSplitPercentage" v-model="userSplitPercentage" step="0.01" min="0" max="100">
            <span class="input-group-text">%</span>
          </div>
        </div>
        <div v-if="splitMethod === 'exact'" class="mb-3">
          <label for="userSplitAmount" class="form-label">Your Split Amount:</label>
          <div class="input-group">
            <span class="input-group-text">$</span>
            <input type="number" class="form-control" id="userSplitAmount" v-model="userSplitAmount" step="0.01" min="0">
          </div>
        </div>
        <div v-if="splitMethod !== 'equal'" class="mb-3">
          <label class="form-label">Split Details:</label>
          <div v-for="participant in participants" :key="participant" class="input-group mb-2">
            <span class="input-group-text">{{ participant }}</span>
            <input type="number" class="form-control" v-model="splitDetails[participant]" :step="splitMethod === 'percentage' ? '0.01' : '0.01'" :min="0" :max="splitMethod === 'percentage' ? 100 : undefined">
            <span class="input-group-text">{{ splitMethod === 'percentage' ? '%' : '$' }}</span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary w-100">Add Expense</button>
      </form>
      <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
      <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
    </div>
  `,
  style: `
    <style>
    @media (max-width: 767px) {
      .container {
        padding-left: 10px;
        padding-right: 10px;
      }
      .form-label {
        font-size: 0.9rem;
      }
      .form-control, .form-select, .input-group-text, .btn {
        font-size: 0.9rem;
      }
      .list-group-item {
        padding: 0.5rem 1rem;
      }
      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }
    }
    </style>
  `
};

export default ExpenseForm;