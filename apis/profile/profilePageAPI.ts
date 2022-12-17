import { EvaluationPostDto } from "apis/home/interfaces";
import { hasuraAxios } from "utils/axios/axios";
import {
  InteractedPostsRequestDto,
  LikedPostsResponseDto,
  ProfileSummaryUpdateRequestDto,
  ProfileSummaryUpdateResponseDto,
  SharedPostsResponseDto,
  UserIdsResponseDto,
  UserSummaryFetchRequestDto,
  UserSummaryFetchResponseDto,
} from "./interfaces";

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

export const getUserPosts = async (
  request: InteractedPostsRequestDto
): Promise<EvaluationPostDto[]> => {
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

export const getUserLikedPosts = async (
  request: InteractedPostsRequestDto
): Promise<LikedPostsResponseDto> => {
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

export const getUserSharedPosts = async (
  request: InteractedPostsRequestDto
): Promise<SharedPostsResponseDto> => {
  try {
    const response = await hasuraAxios.get("/posts/user/shared", {
      params: { ...request },
    });

    if (response.status != 200) {
      throw Error(
        "Can not fetch user posts shared by user: " + request.user_id
      );
    }

    const data = response.data as SharedPostsResponseDto;

    return data;
  } catch (error) {
    console.error(error);
    throw Error("Can not fetch user posts shared by user: " + request.user_id);
  }
};

export const updateProfileSummary = async (
  request: ProfileSummaryUpdateRequestDto
) => {
  try {
    const res = await hasuraAxios.post("/users/profile", null, {
      params: {
        ...request,
      },
    });

    const data = res.data as ProfileSummaryUpdateResponseDto;

    if (res.status == 200 && data.update_user.returning.length > 0) {
      return data;
    }

    throw Error("Can not update profile summary, please check the api request");
  } catch (error) {
    console.error(error);
    throw Error("Can not update profile summary, please check the api request");
  }
};

export default {
  getUserIds,
  getUserSummary,
  getUserPosts,
  updateProfileSummary,
  getUserLikedPosts,
  getUserSharedPosts,
};
