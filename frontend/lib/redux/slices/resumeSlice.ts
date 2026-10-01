import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Resume } from '@/lib/types';

interface ResumeState {
  selectedResumeId: string | null;
  isDirty: boolean;
}

const initialState: ResumeState = {
  selectedResumeId: null,
  isDirty: false,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setSelectedResume(state, action: PayloadAction<string | null>) {
      state.selectedResumeId = action.payload;
    },
    setDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
  },
});

export const { setSelectedResume, setDirty } = resumeSlice.actions;
export default resumeSlice.reducer;
