import { EvaluationPostDto } from "apis/home/interfaces";
import { hasuraAxios } from "utils/axios/axios";

export const getUserIds = async (): Promise<UserIdsResponseDto> => {
  try {
    const res = await hasuraAxios.get("/users/all-ids");

    if (res.status != 200) {
      throw Error("Can not fetch list user ids");
    }

    const data = res.data as UserIdsResponseDto;

    if (data.user.length == 0) {
      throw Error("No user found");
    }

    return data;
  } catch (error) {
    throw Error("Can not fetch list user ids, check api call");
  }
};

export const getUserSummary = async (
  request: UserSummaryFetchRequestDto
): Promise<UserSummaryFetchResponseDto> => {
  try {
    const response = await hasuraAxios.get("/users/profile", {
      params: {
        ...request,
      },
    });

    const data = response.data as UserSummaryFetchResponseDto;

    if (response.status != 200) {
      throwUserSummaryFetchFail(request.user_id);
    }

    if (data.user.length == 0) {
      throwUserSummaryFetchFail(request.user_id);
    }

    return data;
  } catch (err) {
    throwUserSummaryFetchFail(request.user_id);
  }
};

const throwUserSummaryFetchFail = (userId: number) => {
  throw Error("Cannot fetch summary of user: " + userId);
};

export const getUserPosts = async (request: {
  user_id: number;
  limit?: number;
  offset?: number;
}): Promise<EvaluationPostDto[]> => {
  try {
    const response = await hasuraAxios.get("/posts/single-user", {
      params: { ...request },
    });

    if (response.status != 200) {
      throw Error("Can not fetch user posts of user: " + request.user_id);
    }

    const data = (response.data as { evaluation_post: EvaluationPostDto[] })
      .evaluation_post;

    return data;
  } catch (error) {
    console.error(error);
    throw Error("Can not fetch user posts of user: " + request.user_id);
  }
};

export const getUserLikedPosts = async (request: {
  user_id: number;
  limit?: number;
  offset?: number;
}): Promise<LikedPostsResponseDto> => {
  try {
    const response = await hasuraAxios.get("/posts/user/liked", {
      params: { ...request },
    });

    if (response.status != 200) {
      throw Error("Can not fetch user posts liked by user: " + request.user_id);
    }

    const data = response.data as LikedPostsResponseDto;

    return data;
  } catch (error) {
    console.error(error);
    throw Error("Can not fetch user posts liked by user: " + request.user_id);
  }
};

export default {
  getUserIds,
  getUserSummary,
  getUserPosts,
};

// Interfaces

export interface UserIdsResponseDto {
  user: {
    id: number;
  }[];
}

export interface UserSummaryFetchRequestDto {
  user_id: number;
  follower_show_limit: number;
  following_show_limit: number;
}

export interface UserSummaryFetchResponseDto {
  user: {
    id: number;
    image: string;
    user_name: string;
    short_bio: string;
    phone: string;
    about: string;
    email: string;
    updated_at: string;
    created_at: string;
    followersByFollowerId: {
      user_id: number;
      following_id: number;
      created_at: string;
      follower_info: {
        id: number;
        image: string;
        short_bio: string;
        user_name: string;
        created_at: string;
      };
    }[];
    followers: {
      created_at: string;
      following_user: {
        id: number;
        image: string;
        user_name: string;
        short_bio: string;
        created_at: string;
      };
    }[];
    followersByFollowerId_aggregate: {
      aggregate: {
        count: number;
      };
    };
    followers_aggregate: {
      aggregate: {
        count: number;
      };
    };
    evaluation_posts_aggregate: {
      aggregate: {
        count: number;
      };
    };
  }[];
}

export interface LikedPostsResponseDto {
  post_like: {
    post_id: number;
    liked_at: string;
    liked_posts: EvaluationPostDto;
  }[];
}
