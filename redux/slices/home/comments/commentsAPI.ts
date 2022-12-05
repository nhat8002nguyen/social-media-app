import { hasuraAxios } from "utils/axios/axios";

export interface CommentsFetchRequestDto {
  postId: number;
  limit?: number;
  offset?: number;
}

export interface CommentsFetchResponseDto {
  post_comment: CommentDetailResponseDto[];
}

export interface CommentDetailResponseDto {
  id: number;
  text: string;
  thread_id: number;
  user: {
    id: number;
    image: string;
    user_name: string;
    email: string;
    short_bio: string;
  };
  created_at: string;
  edited_at: string;
}

export interface CommentInsertRequestDto {
  userId: number;
  postId: number;
  text: string;
}

export interface CommentInsertResponseDto {
  insert_post_comment: CommentInsertReturningDto;
}

export interface CommentInsertReturningDto {
  returning: CommentDetailResponseDto[];
}

export interface ReplyCommentsFetchRequestDto {
  comment_id: number;
  limit?: number;
  offset?: number;
}

export interface ReplyCommentsFetchResponseDto {
  post_comment: CommentDetailResponseDto[];
}

export const getCommentByPostID = async (
  request: CommentsFetchRequestDto
): Promise<CommentDetailResponseDto[]> => {
  try {
    const response = await hasuraAxios.get("/posts/comments/main", {
      params: {
        post_id: request.postId,
        limit: request.limit,
        offset: request.offset,
      },
    });

    const data = response.data as CommentsFetchResponseDto;

    if (response.status == 200) {
      if (data.post_comment.length == 0) {
        throw Error("No comments found");
      } else if (data.post_comment.length > 0) {
        return data.post_comment;
      }
    }

    throw Error("Can not fetch comments, please check api call");
  } catch (error) {
    console.error(error);
    throw Error("Can not fetch comments of post: " + request.postId);
  }
};

export const insertComment = async (
  request: CommentInsertRequestDto
): Promise<CommentDetailResponseDto> => {
  try {
    const response = await hasuraAxios.post("/posts/comments/main", null, {
      params: {
        user_id: request.userId,
        post_id: request.postId,
        text: request.text,
      },
    });

    const data = response.data as CommentInsertResponseDto;

    if (response.status == 200) {
      if (data.insert_post_comment.returning.length == 0) {
        throw Error("Can not insert comment to DB");
      } else if (data.insert_post_comment.returning.length > 0) {
        return data.insert_post_comment.returning[0];
      }
    }

    throw Error("Can not insert comments, please check api call");
  } catch (error) {
    console.error(error);
    throw Error("Can not insert comments of post: " + request.postId);
  }
};

export const getReplyCommentsOfThread = async (
  request: ReplyCommentsFetchRequestDto
): Promise<CommentDetailResponseDto[]> => {
  try {
    const response = await hasuraAxios.get("/posts/comments/check-replieds", {
      params: {
        ...request,
      },
    });

    const data = response.data as ReplyCommentsFetchResponseDto;

    if (response.status == 200) {
      return data.post_comment;
    }

    return [];
  } catch (error) {
    // prevent promise all fail when a request fail.
    return [];
  }
};
