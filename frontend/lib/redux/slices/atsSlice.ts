import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ATSState {
  lastAnalysisId: string | null;
}

const initialState: ATSState = {
  lastAnalysisId: null,
};

const atsSlice = createSlice({
  name: 'ats',
  initialState,
  reducers: {
    setLastAnalysis(state, action: PayloadAction<string | null>) {
      state.lastAnalysisId = action.payload;
    },
  },
});

export const { setLastAnalysis } = atsSlice.actions;
export default atsSlice.reducer;
