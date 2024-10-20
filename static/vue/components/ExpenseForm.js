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
        } else {
          const newSplitDetails = {};
          this.participants.forEach(participant => {
            newSplitDetails[participant] = this.splitDetails[participant] || '';
          });
          this.splitDetails = newSplitDetails;
          if (this.splitMethod === 'percentage' && this.userSplitPercentage === '') {
            this.userSplitPercentage = '0';
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
        if (this.participants.length < 2) {
          this.error = 'Please add at least two participants.';
          return false;
        }
        if (this.splitMethod !== 'equal') {
          const totalSplit = Object.values(this.splitDetails).reduce((sum, val) => sum + parseFloat(val || 0), 0);
          if (this.splitMethod === 'exact' && Math.abs(totalSplit - parseFloat(this.amount)) > 0.01) {
            this.error = 'The sum of split amounts must equal the total expense amount.';
            return false;
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
        <form @submit.prevent="addExpense">
          <div class="form-group">
            <label for="amount">Amount:</label>
            <input type="number" class="form-control" id="amount" v-model="amount" required step="0.01">
          </div>
          <div class="form-group">
            <label for="description">Description:</label>
            <input type="text" class="form-control" id="description" v-model="description" required>
          </div>
          <div class="form-group">
            <label>Participants:</label>
            <div class="input-group mb-3">
              <input type="text" class="form-control" v-model="newParticipant" placeholder="Enter participant email">
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button" @click="addParticipant">Add</button>
              </div>
            </div>
            <ul class="list-group">
              <li v-for="participant in participants" :key="participant" class="list-group-item d-flex justify-content-between align-items-center">
                {{ participant }}
                <button type="button" class="btn btn-danger btn-sm" @click="removeParticipant(participant)">Remove</button>
              </li>
            </ul>
          </div>
          <div class="form-group">
            <label for="splitMethod">Split Method:</label>
            <select class="form-control" id="splitMethod" v-model="splitMethod">
              <option value="equal">Equal</option>
              <option value="exact">Exact Amount</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>
          <div v-if="splitMethod === 'percentage'" class="form-group">
            <label for="userSplitPercentage">Your Split Percentage:</label>
            <div class="input-group mb-3">
              <input type="number" class="form-control" id="userSplitPercentage" v-model="userSplitPercentage" step="0.01" min="0" max="100">
              <div class="input-group-append">
                <span class="input-group-text">%</span>
              </div>
            </div>
          </div>
          <div v-if="splitMethod !== 'equal'" class="form-group">
            <label>Split Details:</label>
            <div v-for="participant in participants" :key="participant" class="input-group mb-2">
              <div class="input-group-prepend">
                <span class="input-group-text">{{ participant }}</span>
              </div>
              <input type="number" class="form-control" v-model="splitDetails[participant]" :step="splitMethod === 'percentage' ? '0.01' : '0.01'" :min="0" :max="splitMethod === 'percentage' ? 100 : undefined">
              <div class="input-group-append">
                <span class="input-group-text">{{ splitMethod === 'percentage' ? '%' : '$' }}</span>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary mt-3">Add Expense</button>
        </form>
        <p v-if="error" class="text-danger mt-3">{{ error }}</p>
        <p v-if="success" class="text-success mt-3">{{ success }}</p>
      </div>
    `
  };
  
  export default ExpenseForm;