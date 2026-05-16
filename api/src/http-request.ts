import axios, { AxiosResponse, AxiosError } from 'axios';

export async function makeHttpRequest(
  url: string,
  method: string,
  data?: any,
  config?: object,
): Promise<AxiosResponse> {
  try {
    const response = await axios({
      method,
      url,
      data,
      ...config,
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;
      if (axiosError.response) {
        console.error('Error response:', axiosError.response.data);
      } else {
        console.error('Error message:', axiosError.message);
      }
    }
    throw error;
  }
}
