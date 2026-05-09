import axios from 'axios';
import FormData from 'form-data';

const RequisicaoApiFace = {
  async post(url: string, data: unknown) {
    const isForm = data instanceof FormData;
    const response = await axios.post(url, data as FormData | Record<string, unknown>, {
      headers: isForm ? (data as FormData).getHeaders() : undefined,
      timeout: 120_000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    return response.data;
  },
};

export default RequisicaoApiFace;
