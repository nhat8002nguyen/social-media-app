import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";
import { PostDeletionState } from "./postFormSlice";
import * as postListApi from "./postListAPI";
import { PostListRequestDto } from "./postListAPI";
import * as postsConverter from "./postsConverter";

export interface PostListState {
  posts: Array<PostState>;
  loading: "idle" | "loading" | "succeeded" | "failed";
}

export interface PostState {
  id: number;
  postOwner: PostOwnerState;
  title: string | null;
  body: string;
  images: Array<ImageState>;
  hotel: HotelState | null;
  locationRating: number;
  cleanlinessRating: number;
  serviceRating: number;
  valueRating: number;
  likedCount: number;
  sharedCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostOwnerState {
  id: number;
  username: string;
  image: string;
  email?: string;
  shortBio: string | null;
  createdAt: Date;
}

export interface ImageState {
  id: number;
  url: string;
}

export interface HotelState {
  id: number;
  name: string;
  location: string;
  about: string;
  rating: number;
}

const initialState: PostListState = {
  posts: [],
  loading: "idle",
};

export const postListSlice = createSlice({
  name: "postList",
  initialState,
  reducers: {
    deletePresentedPost(state, action: PayloadAction<PostDeletionState>) {
      state.posts = state.posts.filter(
        (post) => post.id != action.payload.postId
      );
    },
    increaseCommentCountOfPost(state, action: PayloadAction<number>) {
      const targetPost = state.posts.find((post) => post.id == action.payload);
      if (targetPost != null) {
        targetPost.commentCount++;
      }
    },
    increaseLikeCountOfPost(state, action: PayloadAction<number>) {
      const targetPost = state.posts.find((post) => post.id == action.payload);
      if (targetPost != null) {
        targetPost.likedCount++;
      }
    },
    decreaseLikeCountOfPost(state, action: PayloadAction<number>) {
      const targetPost = state.posts.find((post) => post.id == action.payload);
      if (targetPost != null && targetPost.likedCount > 0) {
        targetPost.likedCount--;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(findNewsFeedPosts.pending, (state, action) => {
      state.loading = "loading";
    });
    builder.addCase(findNewsFeedPosts.fulfilled, (state, action) => {
      state.posts = postsConverter.updatePostsFromResponse(action.payload);
      state.loading = "succeeded";
    });
    builder.addCase(findNewsFeedPosts.rejected, (state, action) => {
      state.loading = "failed";
    });
  },
});

export const findNewsFeedPosts = createAsyncThunk(
  "posts/newsFeedPosts",
  async (postList: PostListRequestDto, thunkAPI) => {
    return await postListApi.fetchNewsFeedOfUser(postList);
  }
);

export const {
  deletePresentedPost,
  increaseCommentCountOfPost,
  increaseLikeCountOfPost,
  decreaseLikeCountOfPost,
} = postListSlice.actions;

export const selectPostListState = (state: RootState) => state.postList;

export default postListSlice.reducer;
