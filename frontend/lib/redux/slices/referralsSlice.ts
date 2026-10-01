import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ReferralsState {
  selectedCompanyId: string | null;
}

const initialState: ReferralsState = {
  selectedCompanyId: null,
};

const referralsSlice = createSlice({
  name: 'referrals',
  initialState,
  reducers: {
    setSelectedCompany(state, action: PayloadAction<string | null>) {
      state.selectedCompanyId = action.payload;
    },
  },
});

export const { setSelectedCompany } = referralsSlice.actions;
export default referralsSlice.reducer;
