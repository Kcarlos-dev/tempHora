import axios from 'axios';

const RequisicaoApiFace = {
    
  async post(url: string, data: any) {
    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default RequisicaoApiFace;
