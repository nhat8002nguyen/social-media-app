import { hasuraAxios } from "utils/axios/axios";

export interface UserListRequestDto {
  sessionUserId: number;
  limit?: number;
  offset?: number;
}

export interface UserListResponseDto {
  user: UserResponseDto[];
}

export interface UserResponseDto {
  id: number;
  user_name: string;
  image: string;
  short_bio: string | null;
  email: string;
  phone: string | null;
  about: string | null;
  google_account_id: string;
  updated_at: string;
  created_at: string;
  followersByFollowerId: FollowInfoResponseDto[];
}

export interface FollowInfoResponseDto {
  user_id: number;
  following_id: number;
  created_at: string;
}

export interface FollowRequestDto {
  userId: number;
  followingId: number;
}

export interface FollowsResponseDto {
  insert_follower: FollowReturningDto;
}

export interface FollowReturningDto {
  returning: FollowResponseDto[];
}

export interface FollowResponseDto {
  user_id: number;
  following_id: number;
  created_at: string;
}

export interface UnfollowResponseDto {
  delete_follower: FollowReturningDto;
}

export const fetchAllExistedUsers = async (
  request: UserListRequestDto
): Promise<UserListResponseDto> => {
  try {
    const response = await hasuraAxios.get("/users", {
      params: {
        user_id: request.sessionUserId,
        limit: request.limit,
        offset: request.offset,
      },
    });

    if (
      response.status == 200 &&
      (response.data as UserListResponseDto).user.length == 0
    ) {
      throw Error("Something wrong, can not fetch users list");
    }

    if (response.status == 200) {
      return response.data;
    }
  } catch (err) {
    console.error(err);
    throw Error("Can not fetch users list");
  }
};

export const makeAFollow = async (request: FollowRequestDto) => {
  try {
    const response = await hasuraAxios.post("/followers", null, {
      params: {
        user_id: request.userId,
        following_id: request.followingId,
      },
    });

    const data = response.data as FollowsResponseDto;

    if (response.status == 200 && data.insert_follower.returning.length == 0) {
      throw Error("Can not make a follow, please check the api call");
    }

    if (response.status == 200 && data.insert_follower.returning.length > 0) {
      return data.insert_follower.returning[0];
    }
  } catch (err) {
    console.error(err);
    throw Error("Can not make a follow, please try again");
  }
};

export const makeAnUnfollow = async (request: FollowRequestDto) => {
  try {
    const response = await hasuraAxios.delete("/followers", {
      params: {
        user_id: request.userId,
        following_id: request.followingId,
      },
    });

    const data = response.data as UnfollowResponseDto;

    if (response.status == 200 && data.delete_follower.returning.length == 0) {
      throw Error("Can not make an unfollow, check api call");
    }

    if (response.status == 200 && data.delete_follower.returning.length > 0) {
      return data.delete_follower.returning[0];
    }
  } catch (err) {
    console.error(err);
    throw Error("Can not make a unfollow, please try again");
  }
};
