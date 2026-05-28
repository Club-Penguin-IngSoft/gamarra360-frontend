import axios from 'axios';
import { ILoginRequest, ILoginResponse } from '../types/IAuth';
import { API_BASE_URL } from '../constants';

const authService = {
  login: async (credentials: ILoginRequest): Promise<ILoginResponse> => {
    const { data } = await axios.post<ILoginResponse>(
      `${API_BASE_URL}/auth/login`,
      credentials
    );
    return data;
  },

  loginConGoogle: async (idToken: string): Promise<ILoginResponse> => {
    const { data } = await axios.post<ILoginResponse>(
      `${API_BASE_URL}/auth/google`,
      { idToken }
    );
    return data;
  },
};

export default authService;
