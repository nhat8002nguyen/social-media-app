import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CommentDetailResponseDto,
  CommentInsertRequestDto,
  CommentsFetchRequestDto,
  getCommentByPostID,
  getReplyCommentsOfThread,
  insertComment,
  ReplyCommentsFetchRequestDto,
} from "./commentsAPI";

export interface CommentsState {
  comments: CommentDetailState[];
  fetchingStatus: "idle" | "pending" | "success" | "fail";
  commentSessionOpen: CommentSessionOpenProps;
  insertStatus: "idle" | "pending" | "success" | "fail";
  replyInputOpenWithCommentId: number | null;
  repliesFetchStatus: "idle" | "pending" | "success" | "fail";
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
    shortBio: string;
  };
  editedAt: Date;
  createdAt: Date;
  haveReplies?: boolean;
  replies?: CommentDetailState[];
}

export interface CommentSessionOpenProps {
  postId: number | null;
}

const initialState: CommentsState = {
  comments: [],
  fetchingStatus: "idle",
  commentSessionOpen: { postId: null },
  insertStatus: "idle",
  replyInputOpenWithCommentId: null,
  repliesFetchStatus: "idle",
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
    openReplyInputOpenWithCommentId(state, action: PayloadAction<number>) {
      state.replyInputOpenWithCommentId = action.payload;
    },
    closeReplyInputOpen(state, action: PayloadAction<void>) {
      state.replyInputOpenWithCommentId = null;
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
    builder.addCase(addComment.pending, (state, action) => {
      state.insertStatus = "pending";
    });
    builder.addCase(addComment.fulfilled, (state, action) => {
      state.insertStatus = "success";
    });
    builder.addCase(addComment.rejected, (state, action) => {
      state.insertStatus = "fail";
    });
    builder.addCase(
      fetchReplyCommentsOfCurrentComments.pending,
      (state, action) => {}
    );
    builder.addCase(
      fetchReplyCommentsOfCurrentComments.fulfilled,
      (state, action) => {
        action.payload.forEach((incomingReplies) => {
          if (incomingReplies?.length > 0) {
            const threadId = incomingReplies[0].thread_id;
            const targetComment = state.comments.find(
              (com) => com.id == threadId
            );
            targetComment.replies =
              convertCommentsDtoToCommentsState(incomingReplies);
          }
        });
        state.repliesFetchStatus = "success";
      }
    );
    builder.addCase(
      fetchReplyCommentsOfCurrentComments.rejected,
      (state, action) => {}
    );
  },
});

export const fetchCommentsByPostID = createAsyncThunk(
  "comments/fetchCommentsByPostID",
  async (request: CommentsFetchRequestDto, thunkAPI) => {
    const data = await getCommentByPostID(request);
    return data;
  }
);

export const addComment = createAsyncThunk(
  "comments/addComment",
  async (request: CommentInsertRequestDto, thunkAPI) => {
    const data = await insertComment(request);
    return data;
  }
);

export const fetchReplyCommentsOfCurrentComments = createAsyncThunk(
  "comments/fetchReplyComments",
  async (requests: ReplyCommentsFetchRequestDto[], thunkAPI) => {
    const promises = requests.map((req) => getReplyCommentsOfThread(req));
    const data = await Promise.all(promises);
    return data;
  }
);

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
        shortBio: dto.user.short_bio,
      },
      editedAt: new Date(dto.edited_at),
      createdAt: new Date(dto.created_at),
    };
  });

  states.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());

  return states;
};

export const {
  openCommentSession,
  closeCommentSession,
  openReplyInputOpenWithCommentId,
  closeReplyInputOpen,
} = commentsSlice.actions;

export default commentsSlice.reducer;
