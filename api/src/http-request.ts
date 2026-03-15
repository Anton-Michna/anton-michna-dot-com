import axios, { AxiosResponse, AxiosError } from 'axios';

export async function makeHttpRequest(
  url: string,
  method: string,
  data?: any,
): Promise<AxiosResponse> {
  try {
    const response = await axios({
      method: method,
      url: url,
      data: data,
    });

    return response;
  } catch (error) {
    // If an error occurs, handle it here
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
