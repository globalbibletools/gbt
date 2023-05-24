import { ApiClient } from '@translation/api-client';

export default new ApiClient({
  baseUrl: process.env.API_URL ?? '/',
});
