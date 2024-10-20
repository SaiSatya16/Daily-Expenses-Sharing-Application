// File: static/vue/components/BalanceSheet.js
const BalanceSheet = {
    data() {
      return {
        balances: [],
        error: ''
      };
    },
    methods: {
      async fetchBalanceSheet() {
        try {
          const response = await fetch('/balance-sheet', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'balance_sheet.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
          } else {
            const data = await response.json();
            this.error = data.message || 'An error occurred while fetching the balance sheet.';
          }
        } catch (error) {
          this.error = 'An error occurred. Please try again.';
        }
      }
    },
    template: `
      <div class="container mt-5">
        <h2 class="text-center mb-4">Balance Sheet</h2>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <button @click="fetchBalanceSheet" class="btn btn-primary">Download Balance Sheet</button>
      </div>
    `
  };
  
  export default BalanceSheet;