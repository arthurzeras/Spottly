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
        const refreshedAccessToken = await refresh.spotify();

        if (error?.response?.config) {
          const { config } = error.response;

          return await axios({
            url: config.url,
            params: config.params,
            method: config.method,
            headers: {
              Authorization: `Bearer ${refreshedAccessToken}`,
            },
          });
        }

        return Promise.reject(error);
      } catch (e) {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
