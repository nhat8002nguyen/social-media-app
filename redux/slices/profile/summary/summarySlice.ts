import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getUserSummary,
  UserSummaryFetchRequestDto,
  UserSummaryFetchResponseDto,
} from "apis/profile/profilePageAPI";

export interface SummaryState {
  summary: {
    id: number;
    image: string;
    username: string;
    shortBio: string;
    phone: string;
    about: string;
    email: string;
    updatedAt: string;
    createdAt: string;
    followers: {
      userId: number;
      followingId: number;
      createdAt: string;
      follower_info: {
        id: number;
        image: string;
        shortBio: string;
        username: string;
        createdAt: string;
      };
    }[];
    followings: {
      createdAt: string;
      followingUser: {
        id: number;
        image: string;
        username: string;
        shortBio: string;
        createdAt: string;
      };
    }[];
    followersCount: number;
    followingsCount: number;
    evaluationPostsCount: number;
  } | null;
  summaryFetchStatus: "idle" | "pending" | "success" | "fail";
}

const initialState: SummaryState = {
  summary: null,
  summaryFetchStatus: "idle",
};

const summarySlice = createSlice({
  name: "summary",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserSummary.fulfilled, (state, action) => {
      state.summary = convertSummaryResponseToState(action.payload);
    });
  },
});

export const convertSummaryResponseToState = (
  dto: UserSummaryFetchResponseDto
): SummaryState["summary"] => {
  const summaryDto = dto.user[0];
  return {
    id: summaryDto.id,
    image: summaryDto.image,
    username: summaryDto.user_name,
    shortBio: summaryDto.short_bio,
    phone: summaryDto.phone,
    about: summaryDto.about,
    email: summaryDto.email,
    updatedAt: summaryDto.updated_at,
    createdAt: summaryDto.created_at,
    followers: summaryDto.followersByFollowerId.map((f) => ({
      followingId: f.following_id,
      userId: f.user_id,
      createdAt: f.created_at,
      follower_info: {
        id: f.follower_info.id,
        image: f.follower_info.image,
        shortBio: f.follower_info.short_bio,
        username: f.follower_info.user_name,
        createdAt: f.follower_info.created_at,
      },
    })),
    followings: summaryDto.followers.map((f) => ({
      followingUser: {
        id: f.following_user.id,
        image: f.following_user.image,
        username: f.following_user.user_name,
        shortBio: f.following_user.short_bio,
        createdAt: f.following_user.created_at,
      },
      createdAt: f.created_at,
    })),
    followersCount: summaryDto.followersByFollowerId_aggregate.aggregate.count,
    followingsCount: summaryDto.followers_aggregate.aggregate.count,
    evaluationPostsCount: summaryDto.evaluation_posts_aggregate.aggregate.count,
  } as SummaryState["summary"];
};

export const fetchUserSummary = createAsyncThunk(
  "users/profile/fetchSummary",
  async (request: UserSummaryFetchRequestDto, thunkAPI) => {
    return await getUserSummary(request);
  }
);

export const {} = summarySlice.actions;

export default summarySlice.reducer;
