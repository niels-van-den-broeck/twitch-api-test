import axios from 'axios';
import TwitchAuth from './twitch-auth';

export const TwitchApi = axios.create();

TwitchApi.interceptors.request.use(
  async requestConfig => {
    const token = await TwitchAuth.getToken();

    // eslint-disable-next-line no-param-reassign
    requestConfig.headers.Authorization = `Bearer ${token}`;

    return requestConfig;
  },
  error => {
    throw new Error(`Failed request due to: ${error.code} ${error.message}`);
  },
);
