import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as postFormAPI from "../../../../apis/home/postFormAPI";
import { RootState } from "../../../store/store";

export interface PostFormState {
  requestStatus: "idle" | "pending" | "succeeded" | "failed";
  requestUpdationStatus: "idle" | "pending" | "succeeded" | "failed";
  requestDeletionStatus: "idle" | "pending" | "succeeded" | "failed";
  message: string | null;
}

export interface PostFormDetailState {
  userId?: number;
  postId?: number;
  title: string | null;
  body: string;
  hotel: number | null;
  locationRating: number;
  serviceRating: number;
  cleanlinessRating: number;
  valueRating: number;
  images: Array<File>;
}

export interface PostDeletionState {
  userId: number;
  postId: number;
}

const initialState: PostFormState = {
  requestStatus: "idle",
  requestUpdationStatus: "idle",
  requestDeletionStatus: "idle",
  message: null,
};

export const postFormSlice = createSlice({
  name: "postForm",
  initialState,
  reducers: {
    revertRequestStatus(state, action) {
      state.requestStatus = "idle";
      state.requestUpdationStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addNewEvaluationPost.pending, (state, action) => {
      state.requestStatus = "pending";
    });
    builder.addCase(addNewEvaluationPost.fulfilled, (state, action) => {
      state.requestStatus = "succeeded";
    });
    builder.addCase(addNewEvaluationPost.rejected, (state, action) => {
      state.requestStatus = "failed";
    });
    builder.addCase(updateEvaluationPost.pending, (state, action) => {
      state.requestUpdationStatus = "pending";
    });
    builder.addCase(updateEvaluationPost.fulfilled, (state, action) => {
      state.requestUpdationStatus = "succeeded";
    });
    builder.addCase(updateEvaluationPost.rejected, (state, action) => {
      state.requestUpdationStatus = "failed";
    });
  },
});

export const addNewEvaluationPost = createAsyncThunk(
  "posts/addNewPost",
  async (post: PostFormDetailState, thunkAPI) => {
    return await postFormAPI.saveEvaluationPost(post);
  }
);

export const updateEvaluationPost = createAsyncThunk(
  "posts/updatePost",
  async (post: PostFormDetailState, thunkAPI) => {
    return await postFormAPI.updateEvaluationPost(post);
  }
);

export const { revertRequestStatus } = postFormSlice.actions;

export const selectPostListState = (state: RootState) => state.postForm;

export default postFormSlice.reducer;
