import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import resumeReducer from './slices/resumeSlice';
import atsReducer from './slices/atsSlice';
import jobsReducer from './slices/jobsSlice';
import applicationsReducer from './slices/applicationsSlice';
import referralsReducer from './slices/referralsSlice';
import profileReducer from './slices/profileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    resume: resumeReducer,
    ats: atsReducer,
    jobs: jobsReducer,
    applications: applicationsReducer,
    referrals: referralsReducer,
    profile: profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
