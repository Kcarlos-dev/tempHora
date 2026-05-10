import axios from 'axios';
import FormData from 'form-data';
import { GoogleAuth } from 'google-auth-library';
import config from '../config';

const googleAuth = new GoogleAuth();

async function idTokenAuthHeaders(requestUrl: string): Promise<Record<string, string>> {
  const base = config.temphoraApiFace.url?.trim() ?? '';
  if (!base.startsWith('https://')) return {};

  const audience = new URL(base.replace(/\/$/, '')).origin;
  const client = await googleAuth.getIdTokenClient(audience);
  const headers = await client.getRequestHeaders(requestUrl);
  const auth = headers.Authorization;
  return auth ? { Authorization: String(auth) } : {};
}

const RequisicaoApiFace = {
  async post(url: string, data: unknown) {
    const isForm = data instanceof FormData;
    const formHeaders = isForm ? (data as FormData).getHeaders() : {};
    const authHeaders = await idTokenAuthHeaders(url);

    const response = await axios.post(url, data as FormData | Record<string, unknown>, {
      headers: { ...formHeaders, ...authHeaders },
      timeout: 120_000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });
    return response.data;
  },
};

export default RequisicaoApiFace;
