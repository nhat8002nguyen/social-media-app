import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ProfileSummaryUpdateRequestDto,
  UserSummaryFetchResponseDto,
} from "apis/profile/interfaces";

import { updateProfileSummary } from "apis/profile/profilePageAPI";

const initialState: SummaryState = {
  summary: null,
  summaryFetchStatus: "idle",
  summaryUpdateStatus: "idle",
};

const summarySlice = createSlice({
  name: "summary",
  initialState: initialState,
  reducers: {
    setProfileSummary(state, action: PayloadAction<SummaryState["summary"]>) {
      state.summary = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(editProfileSummary.pending, (state, action) => {
      state.summaryUpdateStatus = "pending";
    });
    builder.addCase(editProfileSummary.fulfilled, (state, action) => {
      state.summaryUpdateStatus = "success";
      const updatedInfo = action.payload.update_user.returning[0];
      if (state.summary.id == updatedInfo.id) {
        state.summary = {
          ...state.summary,
          username: updatedInfo.user_name,
          shortBio: updatedInfo.short_bio,
          phone: updatedInfo.phone,
          about: updatedInfo.about,
        };
      }
    });
  },
});

export const { setProfileSummary } = summarySlice.actions;

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

export const editProfileSummary = createAsyncThunk(
  "users/profile/editProfileSummary",
  async (request: ProfileSummaryUpdateRequestDto, thunkAPI) => {
    return await updateProfileSummary(request);
  }
);

export default summarySlice.reducer;

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
  summaryUpdateStatus: "idle" | "pending" | "success" | "fail";
}
