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
  };
  created_at: string;
  edited_at: string;
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
