import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface GlobalState {
  scrollTopButtonVisible: boolean;
}

const initialState: GlobalState = {
  scrollTopButtonVisible: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setScrollTopBtnVisible(state, action: PayloadAction<boolean>) {
      state.scrollTopButtonVisible = action.payload;
    },
  },
});

export const { setScrollTopBtnVisible } = globalSlice.actions;

export default globalSlice.reducer;
