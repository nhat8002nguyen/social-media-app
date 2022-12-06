import { hasuraAxios } from "utils/axios/axios";

export interface LikeInsertRequestDto {
  user_id: number;
  post_id: number;
}

export interface LikeDeleteRequestDto {
  user_id: number;
  post_id: number;
}

export interface LikeInsertResponseDto {
  insert_post_like: {
    returning: {
      user_id: number;
      post_id: number;
      liked_at: string;
    }[];
  };
}

export interface LikeDeleteResponseDto {
  delete_post_like: {
    returning: {
      user_id: number;
      post_id: number;
      liked_at: string;
    }[];
  };
}

export const insertPostLike = async (
  request: LikeInsertRequestDto
): Promise<LikeInsertResponseDto> => {
  try {
    const response = await hasuraAxios.post("/posts/likes", null, {
      params: {
        ...request,
      },
    });

    const data = response.data as LikeInsertResponseDto;

    if (response.status == 200) {
      if (data.insert_post_like.returning.length == 0) {
        throwLikeInsertError(request.post_id);
      } else if (data.insert_post_like.returning.length > 1) {
        return data;
      }
    }

    throwLikeInsertError(request.post_id);
  } catch (error) {}
};

const throwLikeInsertError = (postId: number) => {
  throw Error("Can not give a like to post: " + postId);
};

export const deletePostLike = async (
  request: LikeDeleteRequestDto
): Promise<LikeDeleteResponseDto> => {
  try {
    const response = await hasuraAxios.delete("/posts/likes", {
      params: {
        ...request,
      },
    });

    const data = response.data as LikeDeleteResponseDto;

    if (response.status == 200) {
      if (data.delete_post_like.returning.length == 0) {
        throwLikeDeleteError(request.post_id);
      } else if (data.delete_post_like.returning.length > 1) {
        return data;
      }
    }

    throwLikeDeleteError(request.post_id);
  } catch (error) {}
};

const throwLikeDeleteError = (postId: number) => {
  throw Error("Can not unlike post: " + postId);
};
