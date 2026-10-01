import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ProfilePlatform } from '@/lib/types';

interface ProfileState {
  selectedPlatform: ProfilePlatform;
}

const initialState: ProfileState = {
  selectedPlatform: 'linkedin',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setSelectedPlatform(state, action: PayloadAction<ProfilePlatform>) {
      state.selectedPlatform = action.payload;
    },
  },
});

export const { setSelectedPlatform } = profileSlice.actions;
export default profileSlice.reducer;
