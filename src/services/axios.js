import axios from 'axios';
import refresh from './refresh';

axios.interceptors.response.use(
  (response) => Promise.resolve(response),
  async (error) => {
    if (
      error?.response?.status === 401 &&
      (error?.response?.config?.url || '').includes('api.spotify')
    ) {
      try {
        await refresh.spotify();
        window.location.reload();
      } catch (e) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
