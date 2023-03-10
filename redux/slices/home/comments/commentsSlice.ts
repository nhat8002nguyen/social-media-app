import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  CommentDetailResponseDto,
  CommentInsertRequestDto,
  CommentsFetchRequestDto,
  ReplyCommentsFetchRequestDto,
  getCommentByPostID,
  getReplyCommentsOfThread,
  insertComment,
  insertReplyComment,
} from "../../../../apis/home/commentsAPI";

export interface CommentsState {
  comments: CommentDetailState[];
  fetchingStatus: "idle" | "pending" | "success" | "fail";
  commentSessionOpen: CommentSessionOpenProps;
  insertStatus: "idle" | "pending" | "success" | "fail";
  replyInputOpenWithCommentId: number | null;
  repliesFetchStatus: "idle" | "pending" | "success" | "fail";
  replyInsertStatus: "idle" | "pending" | "success" | "fail";
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
  editedAt: string;
  createdAt: string;
  haveReplies: boolean;
  replies: CommentDetailState[];
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
  replyInsertStatus: "idle",
};

const commentsSlice = createSlice({
  name: "commentsState",
  initialState: initialState,
  reducers: {
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
      state.repliesFetchStatus = "idle";
      state.comments = convertCommentsDtoToCommentsState(action.payload);
      state.commentSessionOpen.postId = action.meta.arg.postId;
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
      fetchReplyCommentsOfCurrentComments.fulfilled,
      (state, action) => {
        action.payload.forEach((incomingReplies) => {
          if (incomingReplies?.length > 0) {
            const threadId = incomingReplies[0].thread_id;
            state.comments = state.comments.map((com) =>
              com.id === threadId
                ? ({
                    ...com,
                    replies: convertCommentsDtoToCommentsState(incomingReplies),
                  } as CommentDetailState)
                : com
            );
          }
        });
        state.repliesFetchStatus = "success";
      }
    );
    builder.addCase(addReplyComment.pending, (state, action) => {
      state.replyInsertStatus = "pending";
    });
    builder.addCase(addReplyComment.fulfilled, (state, action) => {
      state.replyInsertStatus = "success";
    });
    builder.addCase(addReplyComment.rejected, (state, action) => {
      state.replyInsertStatus = "fail";
    });
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

export const addReplyComment = createAsyncThunk(
  "comments/addReplyComment",
  async (request: CommentInsertRequestDto, thunkAPI) => {
    const data = await insertReplyComment(request);
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
      editedAt: dto.edited_at,
      createdAt: dto.created_at,
      haveReplies: false,
      replies: [],
    } as CommentDetailState;
  });

  states.sort(
    (a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
  );

  return states;
};

export const {
  closeCommentSession,
  openReplyInputOpenWithCommentId,
  closeReplyInputOpen,
} = commentsSlice.actions;

export default commentsSlice.reducer;
