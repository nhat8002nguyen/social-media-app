import { hasuraAxios } from "utils/axios/axios";

export interface ShareInsertRequestDto {
  user_id: number;
  post_id: number;
}

export interface ShareDeleteRequestDto {
  user_id: number;
  post_id: number;
}

export interface ShareInsertResponseDto {
  insert_post_share: {
    returning: {
      user_id: number;
      post_id: number;
      shared_at: string;
    }[];
  };
}

export interface ShareDeleteResponseDto {
  delete_post_share: {
    returning: {
      user_id: number;
      post_id: number;
      shared_at: string;
    }[];
  };
}

export const insertPostShare = async (
  request: ShareInsertRequestDto
): Promise<ShareInsertResponseDto> => {
  try {
    const response = await hasuraAxios.post("/posts/shares", null, {
      params: {
        ...request,
      },
    });

    const data = response.data as ShareInsertResponseDto;

    if (response.status == 200) {
      if (data.insert_post_share.returning.length == 0) {
        throwShareInsertError(request.post_id);
      } else if (data.insert_post_share.returning.length > 0) {
        return data;
      }
    }

    throwShareInsertError(request.post_id);
  } catch (error) {
    throwShareInsertError(request.post_id);
  }
};

const throwShareInsertError = (postId: number) => {
  throw Error("Can not share the post: " + postId);
};

export const deletePostShare = async (
  request: ShareDeleteRequestDto
): Promise<ShareDeleteResponseDto> => {
  try {
    const response = await hasuraAxios.delete("/posts/shares", {
      params: {
        ...request,
      },
    });

    const data = response.data as ShareDeleteResponseDto;

    if (response.status == 200) {
      if (data.delete_post_share.returning.length == 0) {
        throwShareDeleteError(request.post_id);
      } else if (data.delete_post_share.returning.length > 0) {
        return data;
      }
    }

    throwShareDeleteError(request.post_id);
  } catch (error) {}
};

const throwShareDeleteError = (postId: number) => {
  throw Error("Can not unshare post: " + postId);
};

export default {
  insertPostShare,
  deletePostShare,
};
