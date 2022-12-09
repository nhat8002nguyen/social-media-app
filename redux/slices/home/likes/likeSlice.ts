import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  deletePostLike,
  insertPostLike,
  LikeDeleteRequestDto,
  LikeInsertRequestDto,
} from "../../../../apis/home/likeAPI";

export interface LikeState {
  likeInsertStatus: "idle" | "pending" | "success" | "fail";
  likeDeleteStatus: "idle" | "pending" | "success" | "fail";
}

const initialState: LikeState = {
  likeInsertStatus: "idle",
  likeDeleteStatus: "idle",
};

const likeSlice = createSlice({
  name: "likeState",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(likePost.pending, (state, action) => {
      state.likeInsertStatus = "pending";
    });
    builder.addCase(likePost.fulfilled, (state, action) => {
      state.likeInsertStatus = "success";
    });
    builder.addCase(likePost.rejected, (state, action) => {
      state.likeInsertStatus = "fail";
    });
    builder.addCase(undoPostLike.pending, (state, action) => {
      state.likeDeleteStatus = "pending";
    });
    builder.addCase(undoPostLike.fulfilled, (state, action) => {
      state.likeDeleteStatus = "success";
    });
    builder.addCase(undoPostLike.rejected, (state, action) => {
      state.likeDeleteStatus = "fail";
    });
  },
});

export const likePost = createAsyncThunk(
  "posts/likes/likePost",
  async (request: LikeInsertRequestDto) => {
    return await insertPostLike(request);
  }
);

export const undoPostLike = createAsyncThunk(
  "posts/likes/deletePostLike",
  async (request: LikeDeleteRequestDto) => {
    return await deletePostLike(request);
  }
);

export default likeSlice.reducer;
