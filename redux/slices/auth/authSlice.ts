import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addGoogleAccountToDBIfNotExist,
  UserRequestDto,
} from "../../../apis/auth/authAPI";
import { RootState } from "../../store/store";

export interface AuthState {
  sessionStatus: "authenticated" | "loading" | "unauthenticated";
  session: Session | null;
  syncDBStatus?: "idle" | "pending" | "succeeded" | "failed";
}

export interface Session {
  user: SessionUser;
  accessToken: string;
  error: string;
}

export interface SessionUser {
  db_id: number | null;
  name: string;
  email: string;
  image: string;
  google_account_id?: String;
}

const initialState: AuthState = {
  sessionStatus: "unauthenticated",
  session: null,
  syncDBStatus: "idle",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<AuthState>) {
      state.sessionStatus = action.payload.sessionStatus;
      state.session = action.payload.session;
      state.syncDBStatus = action.payload.syncDBStatus;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(syncGoogleAccountDB.pending, (state, action) => {
      state.syncDBStatus = "pending";
    });
    builder.addCase(syncGoogleAccountDB.fulfilled, (state, action) => {
      state.syncDBStatus = "succeeded";
      if (action.payload?.user?.length > 0) {
        state.session.user.db_id = action.payload?.user[0]?.id;
      } else if (action.payload?.insert_user_one != null) {
        state.session.user.db_id = action.payload?.insert_user_one.id;
      }
    });
  },
});

export const syncGoogleAccountDB = createAsyncThunk(
  "users/syncGoogleAccountDB",
  async (user: UserRequestDto, thunkAPI) => {
    const response = await addGoogleAccountToDBIfNotExist(user);
    return response;
  }
);

export const { setAuthState } = authSlice.actions;

export const selectAuthState = (state: RootState) => state.auth;

export default authSlice.reducer;
