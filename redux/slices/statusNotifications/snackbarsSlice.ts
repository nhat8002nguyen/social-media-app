import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";

export interface SnackbarState {
  severity: "none" | "error" | "warning" | "info" | "success";
  message: string;
}

const initialState: SnackbarState = {
  severity: "none",
  message: "No message found",
};

export const snackbarsSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    toggleSnackbar(state, action: PayloadAction<SnackbarState>) {
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
  },
  extraReducers: (builder) => {},
});

export const { toggleSnackbar } = snackbarsSlice.actions;

export const selectSnackbarState = (state: RootState) => state.snackbar;

export default snackbarsSlice.reducer;
