import axios from 'axios';
import { ILoginRequest, ILoginResponse } from '../types/IAuth';
import { API_BASE_URL } from '../constants';
import { MOCK_EMAIL, MOCK_PASSWORD, MOCK_LOGIN_RESPONSE } from '../mocks/clienteMock';

const authService = {
  login: async (credentials: ILoginRequest): Promise<ILoginResponse> => {
    if (
      credentials.email === MOCK_EMAIL &&
      credentials.contrasenha === MOCK_PASSWORD
    ) {
      return MOCK_LOGIN_RESPONSE;
    }
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
