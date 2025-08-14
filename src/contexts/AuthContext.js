import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, USER_TYPES, getApiUrl } from '../config/api.config';
import { createLogger } from '../utils/logger';

axios.defaults.withCredentials = true;

const AuthContext = createContext();
const logger = createLogger('AuthContext');

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(getApiUrl(API_ENDPOINTS.USER_PROFILE));
      const data = res.data;
      if (data.role === USER_TYPES.ADMIN) {
        setUser({ ...data, isAdmin: true, isBusiness: false, isCharity: false });
      } else {
        setUser({ ...data, isAdmin: false, isBusiness: false, isCharity: false });
      }
      return;
    } catch (errUser) {
      try {
        const resBiz = await axios.get(getApiUrl(API_ENDPOINTS.BUSINESS_PROFILE));
        setUser({ ...resBiz.data, isBusiness: true, isCharity: false });
        return;
      } catch (errBiz) {
        try {
          const resChar = await axios.get(getApiUrl(API_ENDPOINTS.CHARITY_PROFILE));
          setUser({ ...resChar.data, isBusiness: false, isCharity: true });
          return;
        } catch (errChar) {
          setUser(null);
        }
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUser();
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    await axios.post(getApiUrl(API_ENDPOINTS.USER_LOGIN), { email, password });
    await fetchUser();
  };

  const userSignup = async (name, email, password) => {
    await axios.post(getApiUrl(API_ENDPOINTS.USER_REGISTER), { name, email, password });
    await fetchUser();
  };

  const businessLogin = async (emailOrContactEmail, password) => {
    await axios.post(getApiUrl(API_ENDPOINTS.BUSINESS_LOGIN), {
      email: emailOrContactEmail,
      contactEmail: emailOrContactEmail,
      password,
    });
    await fetchUser();
  };

  const businessSignup = async (signupData) => {
    await axios.post(getApiUrl(API_ENDPOINTS.BUSINESS_SIGNUP), signupData);
    await fetchUser();
  };

  const charityLogin = async (contactEmail, password) => {
    await axios.post(getApiUrl(API_ENDPOINTS.CHARITY_LOGIN), { contactEmail, password });
    await fetchUser();
  };

  const charitySignup = async (signupData) => {
    await axios.post(getApiUrl(API_ENDPOINTS.CHARITY_SIGNUP), signupData);
    await fetchUser();
  };

  const logout = async () => {
    try {
      await axios.post(getApiUrl(API_ENDPOINTS.AUTH_LOGOUT));
    } catch (err) {
      logger.error('Logout failed', err);
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    userSignup,
    businessLogin,
    businessSignup,
    charityLogin,
    charitySignup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
