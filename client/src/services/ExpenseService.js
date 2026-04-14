import axios from 'axios';

const url = '/api/expenses/';

class ExpenseService {

  static async getExpenses() {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  static insertExpense(description, amount, category, date) {
    return axios.post(url, { description, amount, category, date });
  }

  static updateExpense(id, description, amount, category, date) {
    return axios.put(url + id, { description, amount, category, date });
  }

  static deleteExpense(id) {
    return axios.delete(url + id);
  }
}

export default ExpenseService;
