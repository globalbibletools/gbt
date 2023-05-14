import { ApiClient } from '@translation/api-client';
import getApiUrl from './apiUrl';

export default new ApiClient({
  baseUrl: getApiUrl(),
});
