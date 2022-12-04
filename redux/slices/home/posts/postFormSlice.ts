import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";
import * as postFormAPI from "./postFormAPI";

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
    builder.addCase(postNewEvaluationPost.pending, (state, action) => {
      state.requestStatus = "pending";
    });
    builder.addCase(postNewEvaluationPost.fulfilled, (state, action) => {
      state.requestStatus = "succeeded";
    });
    builder.addCase(postNewEvaluationPost.rejected, (state, action) => {
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
    builder.addCase(deleteEvaluationPost.pending, (state, action) => {
      state.requestDeletionStatus = "pending";
    });
    builder.addCase(deleteEvaluationPost.fulfilled, (state, action) => {
      state.requestDeletionStatus = "succeeded";
    });
    builder.addCase(deleteEvaluationPost.rejected, (state, action) => {
      state.requestDeletionStatus = "failed";
    });
  },
});

export const postNewEvaluationPost = createAsyncThunk(
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

export const deleteEvaluationPost = createAsyncThunk(
  "posts/deletePost",
  async (deletion: PostDeletionState, thunkAPI) => {
    return await postFormAPI.deleteEvaluationPost(deletion);
  }
);

export const { revertRequestStatus } = postFormSlice.actions;

export const selectPostListState = (state: RootState) => state.postForm;

export default postFormSlice.reducer;
