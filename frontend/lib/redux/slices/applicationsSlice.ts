import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ApplicationStatus } from '@/lib/types';

interface ApplicationsState {
  statusFilter: ApplicationStatus | 'all';
}

const initialState: ApplicationsState = {
  statusFilter: 'all',
};

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<ApplicationStatus | 'all'>) {
      state.statusFilter = action.payload;
    },
  },
});

export const { setStatusFilter } = applicationsSlice.actions;
export default applicationsSlice.reducer;
