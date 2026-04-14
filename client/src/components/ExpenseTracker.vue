<template>
  <div class="app">

    <header class="app-header">
      <div class="header-left">
        <h1>Expense Tracker</h1>
        <p class="subtitle">Budgeting made easy</p>
      </div>
      <div class="total-badge">
        <span class="total-label">Total Spent</span>
        <span class="total-amount">${{ totalAmount }}</span>
      </div>
    </header>

    <div class="cat-strip">
      <div
        v-for="cat in categories"
        :key="cat"
        v-show="categoryTotals[cat] > 0"
        class="cat-chip"
        :class="'chip-' + cat.toLowerCase()"
      >
        <span class="chip-name">{{ cat }}</span>
        <span class="chip-total">${{ (categoryTotals[cat] || 0).toFixed(2) }}</span>
      </div>
    </div>

    <div class="card add-card">
      <h2 class="card-title">New Expense</h2>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <div class="form-grid">
        <input v-model="newDesc" class="field" placeholder="Description of expense" />
        <input v-model.number="newAmount" type="number" class="field field-sm" placeholder="Amount (USD)" min="0" step="0.01" />
        <select v-model="newCategory" class="field">
          <option value="" disabled>Category</option>
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
        <input v-model="newDate" type="date" class="field field-sm" />
      </div>
      <button class="btn btn-add" @click="createExpense">＋ Add Expense to List</button>
    </div>

    <div class="card list-card">
      <div class="list-header">
        <h2 class="card-title">
          {{ filterCategory ? filterCategory : 'All' }} Expenses
          <span class="count-badge">{{ filteredExpenses.length }}</span>
        </h2>
        <select v-model="filterCategory" class="field field-filter">
          <option value="">All categories</option>
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select>
      </div>

    <div class="card chart-card" v-if="expenses.length > 0">
      <h2 class="card-title">Spending by Category</h2>
      <canvas id="spendingChart"></canvas>
    </div>

      <p v-if="filteredExpenses.length === 0" class="empty-msg">No expenses here yet!</p>

      <div v-for="expense in filteredExpenses" :key="expense._id" class="expense-item">

        <template v-if="editingId !== expense._id">
          <span class="cat-pill" :class="'pill-' + expense.category.toLowerCase()">
            {{ expense.category }}
          </span>
          <div class="item-info">
            <span class="item-desc">{{ expense.description }}</span>
            <span class="item-date">{{ expense.date }}</span>
          </div>
          <span class="item-amount">${{ parseFloat(expense.amount).toFixed(2) }}</span>
          <div class="item-btns">
            <button class="icon-btn edit-btn" @click="startEdit(expense)">Edit</button>
            <button class="icon-btn del-btn" @click="deleteExpense(expense._id)">Delete</button>
          </div>
        </template>

        <template v-else>
          <div class="edit-form">
            <div class="form-grid">
              <input v-model="editDesc" class="field" placeholder="Description" />
              <input v-model.number="editAmount" type="number" class="field field-sm" placeholder="Amount" min="0" step="0.01" />
              <select v-model="editCategory" class="field">
                <option v-for="cat in categories" :key="cat">{{ cat }}</option>
              </select>
              <input v-model="editDate" type="date" class="field field-sm" />
            </div>
            <div class="edit-actions">
              <button class="btn btn-save" @click="saveEdit(expense._id)">Save</button>
              <button class="btn btn-cancel" @click="editingId = null">✕ Cancel</button>
            </div>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>

<script>
import ExpenseService from '../services/ExpenseService';
import Chart from 'chart.js/auto';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Health', 'Other'];

export default {
  name: 'ExpenseTracker',
  data() {
    return {
      expenses: [],
      error: '',
      categories: CATEGORIES,
      filterCategory: '',
      newDesc: '',
      newAmount: '',
      newCategory: '',
      newDate: new Date().toISOString().split('T')[0],
      editingId: null,
      editDesc: '',
      editAmount: '',
      editCategory: '',
      editDate: '',
      chartInstance: null,
    };
  },
  computed: {
    totalAmount() {
      return this.expenses
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0)
        .toFixed(2);
    },
    categoryTotals() {
      const totals = {};
      this.expenses.forEach(e => {
        totals[e.category] = (totals[e.category] || 0) + parseFloat(e.amount || 0);
      });
      return totals;
    },
    filteredExpenses() {
      if (!this.filterCategory) return this.expenses;
      return this.expenses.filter(e => e.category === this.filterCategory);
    },
  },
  async created() {
    await this.loadExpenses();
  },
  methods: {
    async loadExpenses() {
        try {
            this.expenses = await ExpenseService.getExpenses();
            this.$nextTick(() => this.renderChart());
        } catch (err) {
            this.error = err.message;
        }
    },
    async createExpense() {
      if (!this.newDesc.trim() || !this.newAmount || !this.newCategory || !this.newDate) {
        this.error = 'Please fill in all fields.';
        return;
      }
      if (this.newAmount <= 0) {
        this.error = 'Amount must be greater than 0.';
        return;
      }
      try {
        await ExpenseService.insertExpense(this.newDesc, this.newAmount, this.newCategory, this.newDate);
        this.newDesc = '';
        this.newAmount = '';
        this.newCategory = '';
        this.newDate = new Date().toISOString().split('T')[0];
        this.error = '';
        await this.loadExpenses();
      } catch (err) {
        this.error = err.message;
      }
    },
    startEdit(expense) {
      this.editingId = expense._id;
      this.editDesc = expense.description;
      this.editAmount = expense.amount;
      this.editCategory = expense.category;
      this.editDate = expense.date;
    },
    async saveEdit(id) {
      if (!this.editDesc.trim() || !this.editAmount || !this.editCategory || !this.editDate) {
        this.error = 'All fields are required.';
        return;
      }
      try {
        await ExpenseService.updateExpense(id, this.editDesc, this.editAmount, this.editCategory, this.editDate);
        this.editingId = null;
        this.error = '';
        await this.loadExpenses();
      } catch (err) {
        this.error = err.message;
      }
    },
    async deleteExpense(id) {
      try {
        await ExpenseService.deleteExpense(id);
        await this.loadExpenses();
      } catch (err) {
        this.error = err.message;
      }
    },
    renderChart() {
        const ctx = document.getElementById('spendingChart');
        if (!ctx) return;
        if (this.chartInstance) this.chartInstance.destroy();
        const categoryColors = {
            Food:          '#ffd699',
            Transport:     '#85b7eb',
            Entertainment: '#cbc4f5',
            Shopping:      '#f4afc8',
            Bills:         '#ef9595',
            Health:        '#97c459',
            Other:         '#b4b2a9',
        };
        const labels = Object.keys(this.categoryTotals);
        const data = Object.values(this.categoryTotals);
        const colors = labels.map(l => categoryColors[l] || '#c0e1d2');
        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
                borderRadius: 6,
            }]
            },
            options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => '$' + v } }
            }
            }
        });
    },
  },
};
</script>

<style scoped>
.app { max-width: 820px; margin: 0 auto; padding: 28px 20px 60px; font-family: 'Segoe UI', system-ui, sans-serif; }
.app-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.app-header h1 { font-size: 1.9rem; color: #5a7a6e; margin: 0 0 4px; }
.subtitle { color: #8a9e98; font-size: 0.9rem; margin: 0; }
.total-badge { background: #dc9b9b; color: #fff; border-radius: 12px; padding: 12px 22px; text-align: center; }
.total-label { display: block; font-size: 0.72rem; color: #f6f4e8; letter-spacing: 0.05em; text-transform: uppercase; }
.total-amount { display: block; font-size: 1.7rem; font-weight: 700; color: #fff; margin-top: 2px; }
.cat-strip { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
.cat-chip { display: flex; align-items: center; gap: 5px; border-radius: 20px; padding: 5px 12px; font-size: 0.8rem; font-weight: 600; }
.chip-food, .pill-food { background: #fff3e0; color: #b35c00; }
.chip-transport, .pill-transport { background: #e3f2fd; color: #1565c0; }
.chip-entertainment, .pill-entertainment { background: #f3e5f5; color: #6a1b9a; }
.chip-shopping, .pill-shopping { background: #fce4ec; color: #880e4f; }
.chip-bills, .pill-bills { background: #ffebee; color: #b71c1c; }
.chip-health, .pill-health { background: #e8f5e9; color: #1b5e20; }
.chip-other, .pill-other { background: #f5f5f5; color: #424242; }
.card { background: #fff; border: 1px solid #e5eee4; border-radius: 14px; padding: 22px 24px; margin-bottom: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.card-title { font-size: 1rem; font-weight: 700; color: #5a7a6e; margin: 0 0 16px; display: flex; align-items: center; gap: 8px; }
.form-grid { display: grid; grid-template-columns: 1fr auto 1fr auto; gap: 10px; margin-bottom: 14px; }
@media (max-width: 600px) { .form-grid { grid-template-columns: 1fr 1fr; } }
.field { width: 100%; padding: 9px 12px; border: 1px solid #c0e1d2; border-radius: 8px; font-size: 0.9rem; color: #555; background: #f6f4e8; box-sizing: border-box; transition: border-color 0.15s; }
.field:focus { outline: none; border-color: #dc9b9b; background: #fff; }
.field-sm { max-width: 160px; }
.field-filter { max-width: 180px; font-size: 0.85rem; }
.error-msg { background: #fceaea; border: 1px solid #dc9b9b; color: #a05050; padding: 9px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 14px; }
.btn { padding: 9px 20px; border: none; border-radius: 8px; font-size: 0.88rem; font-weight: 600; cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
.btn:hover { opacity: 0.88; }
.btn:active { transform: scale(0.97); }
.btn-add { background: #c0e1d2; color: #3d6b5e; }
.btn-save { background: #c0e1d2; color: #3d6b5e; }
.btn-cancel { background: #f6f4e8; color: #888; }
.list-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
.count-badge { background: #e5eee4; color: #5a7a6e; font-size: 0.75rem; padding: 2px 8px; border-radius: 20px; font-weight: 700; }
.empty-msg { text-align: center; color: #aaa; padding: 30px 0; font-size: 0.9rem; }
.expense-item { border-top: 1px solid #e5eee4; padding: 12px 0; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.expense-item:first-of-type { border-top: none; padding-top: 0; }
.cat-pill { font-size: 0.72rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
.pill-food { background: #c0e1d2; color: #3d6b5e; }
.pill-transport { background: #c0e1d2; color: #3d6b5e; }
.pill-entertainment { background: #dc9b9b; color: #7a3a3a; }
.pill-shopping { background: #dc9b9b; color: #7a3a3a; }
.pill-bills { background: #e5eee4; color: #5a7a6e; }
.pill-health { background: #e5eee4; color: #5a7a6e; }
.pill-other { background: #f6f4e8; color: #8a7a6a; }
.item-info { flex: 1; min-width: 0; }
.item-desc { display: block; font-size: 0.92rem; font-weight: 600; color: #444; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-date { display: block; font-size: 0.75rem; color: #aaa; margin-top: 2px; }
.item-amount { font-size: 1rem; font-weight: 700; color: #dc9b9b; white-space: nowrap; }
.item-btns { display: flex; gap: 6px; }
.icon-btn { background: none; border: 1px solid #e5eee4; border-radius: 6px; padding: 4px 10px; cursor: pointer; font-size: 0.82rem; font-weight: 600; transition: background 0.15s; color: #777; }
.edit-btn:hover { background: #e5eee4; color: #5a7a6e; }
.del-btn:hover { background: #fceaea; color: #dc9b9b; }
.edit-form { width: 100%; }
.edit-actions { display: flex; gap: 8px; margin-top: 10px; }
</style>