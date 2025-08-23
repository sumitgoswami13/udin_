import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store';
import { 
  loginUser, 
  registerUser, 
  adminLogin, 
  logout, 
  clearError,
  refreshAccessToken 
} from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const login = useCallback(
    (credentials: { email: string; password: string }) => {
      return dispatch(loginUser(credentials));
    },
    [dispatch]
  );

  const register = useCallback(
    (userData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      state: string;
      pinCode: string;
      password: string;
    }) => {
      return dispatch(registerUser(userData));
    },
    [dispatch]
  );

  const adminSignIn = useCallback(
    (credentials: { username: string; password: string }) => {
      return dispatch(adminLogin(credentials));
    },
    [dispatch]
  );

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshToken = useCallback(() => {
    return dispatch(refreshAccessToken());
  }, [dispatch]);

  return {
    ...authState,
    login,
    register,
    adminSignIn,
    signOut,
    clearAuthError,
    refreshToken,
  };
};