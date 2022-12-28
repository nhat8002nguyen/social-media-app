import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { PostState } from "../home/posts/interfaces";

export interface TrendingState {
  posts: PostState[];
}

const initialState: TrendingState = {
  posts: [],
};

const trendingSlice = createSlice({
  name: "trending",
  initialState,
  reducers: {
    setTrendingPosts(state, action: PayloadAction<PostState[]>) {
      state.posts = action.payload;
    },
  },
});

export const { setTrendingPosts } = trendingSlice.actions;

export default trendingSlice.reducer;
