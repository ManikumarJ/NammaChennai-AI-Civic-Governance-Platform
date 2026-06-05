import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('nc_token') || null;
let user = null;

try {
  const cachedUser = localStorage.getItem('nc_user');
  if (cachedUser) {
    user = JSON.parse(cachedUser);
  }
} catch (e) {
  console.error('Failed to parse cached user:', e);
}

const initialState = {
  user,
  token,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('nc_token', token);
      localStorage.setItem('nc_user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('nc_token');
      localStorage.removeItem('nc_user');
    },
    updateVerification: (state) => {
      if (state.user) {
        state.user.emailVerified = true;
        localStorage.setItem('nc_user', JSON.stringify(state.user));
      }
    }
  }
});

export const { setCredentials, logout, updateVerification } = authSlice.actions;
export default authSlice.reducer;
