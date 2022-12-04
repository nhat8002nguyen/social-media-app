import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CommentDetailResponseDto,
  CommentsFetchRequestDto,
  getCommentByPostID,
} from "./commentsAPI";

export interface CommentsState {
  comments: CommentDetailState[];
  fetchingStatus: "idle" | "pending" | "success" | "fail";
  commentSessionOpen: CommentSessionOpenProps;
}

export interface CommentDetailState {
  id: number;
  text: string;
  threadId: number;
  owner: {
    id: number;
    image: string;
    username: string;
    email: string;
  };
  editedAt: Date;
  createdAt: Date;
}

export interface CommentSessionOpenProps {
  postId: number | null;
}

const initialState: CommentsState = {
  comments: [],
  fetchingStatus: "idle",
  commentSessionOpen: { postId: null },
};

const commentsSlice = createSlice({
  name: "commentsState",
  initialState: initialState,
  reducers: {
    openCommentSession(state, action: PayloadAction<CommentSessionOpenProps>) {
      state.commentSessionOpen.postId = action.payload.postId;
    },
    closeCommentSession(state, action: PayloadAction<void>) {
      state.commentSessionOpen.postId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCommentsByPostID.pending, (state, action) => {
      state.fetchingStatus = "pending";
    });
    builder.addCase(fetchCommentsByPostID.fulfilled, (state, action) => {
      state.fetchingStatus = "success";
      state.comments = convertCommentsDtoToCommentsState(action.payload);
    });
    builder.addCase(fetchCommentsByPostID.rejected, (state, action) => {
      state.fetchingStatus = "fail";
      state.comments = [];
    });
  },
});

const convertCommentsDtoToCommentsState = (
  dtos: CommentDetailResponseDto[]
): CommentDetailState[] => {
  const states = dtos.map((dto) => {
    return {
      id: dto.id,
      text: dto.text,
      threadId: dto.thread_id,
      owner: {
        id: dto.user.id,
        image: dto.user.image,
        username: dto.user.user_name,
        email: dto.user.email,
      },
      editedAt: new Date(dto.edited_at),
      createdAt: new Date(dto.created_at),
    };
  });

  states.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());

  return states;
};

export const fetchCommentsByPostID = createAsyncThunk(
  "comments/fetchCommentsByPostID",
  async (request: CommentsFetchRequestDto, thunkAPI) => {
    const data = await getCommentByPostID(request);
    return data;
  }
);

export const { openCommentSession, closeCommentSession } =
  commentsSlice.actions;

export default commentsSlice.reducer;
