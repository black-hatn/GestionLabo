export const useAuthStore = () => {
  if (typeof window === 'undefined') {
    return {
      accessToken: null,
      user: null,
      login: () => {},
      logout: () => {},
    };
  }

  const accessToken = localStorage.getItem('access_token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  return {
    accessToken,
    user,
    login: (token: string, userData: any) => {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify({
        id: userData?.id || userData?.sub,
        email: userData?.email,
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        role: userData?.role || 'USER',
        is_active: userData?.is_active !== false,
      }));
    },
    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },
  };
};
