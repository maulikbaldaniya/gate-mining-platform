import api from './api';

export const formulaService = {
  async getFormulas(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/formulas?${query}`);
    return res.data.data.formulas;
  },

  async toggleBookmark(formulaData) {
    const res = await api.post('/formulas/toggle-bookmark', formulaData);
    return res.data.data.formula;
  },
};
