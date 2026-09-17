import api from './api';

export const revisionService = {
  async getTodayRevisions() {
    const res = await api.get('/revision/today');
    return res.data.data.revisions;
  },

  async completeRevision(revisionId) {
    const res = await api.post(`/revision/${revisionId}/complete`);
    return res.data;
  },
};
