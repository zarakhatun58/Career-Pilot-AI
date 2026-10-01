import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  notifications: { id: string; title: string; message: string; read: boolean; createdAt: string }[];
  commandPaletteOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: false,
  commandPaletteOpen: false,
  notifications: [
    {
      id: 'n1',
      title: 'New job match',
      message: 'A Senior Frontend Engineer role at Vercel matches your profile (91% match)',
      read: false,
      createdAt: '2024-09-10T08:00:00Z',
    },
    {
      id: 'n2',
      title: 'Application update',
      message: 'Your application at Airbnb has moved to the Interview stage',
      read: false,
      createdAt: '2024-09-09T14:00:00Z',
    },
    {
      id: 'n3',
      title: 'ATS analysis complete',
      message: 'Your resume scored 82/100 for the Airbnb role',
      read: true,
      createdAt: '2024-09-01T14:00:00Z',
    },
  ],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) notif.read = true;
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach((n) => (n.read = true));
    },
    setCommandPaletteOpen(state, action: PayloadAction<boolean>) {
      state.commandPaletteOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  markNotificationRead,
  markAllNotificationsRead,
  setCommandPaletteOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
