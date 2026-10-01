import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WorkMode, EmploymentType, ExperienceLevel } from '@/lib/types';

export interface JobFilters {
  query: string;
  country: string;
  workMode: WorkMode | 'all';
  employmentType: EmploymentType | 'all';
  experienceLevel: ExperienceLevel | 'all';
  postedWithin: '24h' | '7d' | '30d' | 'all';
  salaryMin: number | null;
}

interface JobsState {
  filters: JobFilters;
  savedJobIds: string[];
}

const initialState: JobsState = {
  filters: {
    query: '',
    country: 'all',
    workMode: 'all',
    employmentType: 'all',
    experienceLevel: 'all',
    postedWithin: '30d',
    salaryMin: null,
  },
  savedJobIds: [],
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<JobFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    toggleSavedJob(state, action: PayloadAction<string>) {
      const idx = state.savedJobIds.indexOf(action.payload);
      if (idx >= 0) {
        state.savedJobIds.splice(idx, 1);
      } else {
        state.savedJobIds.push(action.payload);
      }
    },
    setSavedJobIds(state, action: PayloadAction<string[]>) {
      state.savedJobIds = action.payload;
    },
  },
});

export const { setFilters, resetFilters, toggleSavedJob, setSavedJobIds } = jobsSlice.actions;
export default jobsSlice.reducer;
