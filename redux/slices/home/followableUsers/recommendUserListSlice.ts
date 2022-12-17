import { generateRandom } from "@/shared/utils/home";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  FollowRequestDto,
  UserListRequestDto,
  UserListResponseDto,
} from "apis/home/interfaces";

import {
  fetchAllExistedUsers as fetchAllUsers,
  makeAFollow,
  makeAnUnfollow,
} from "apis/home/recommendUserListAPI";

const NUMBER_SHOWN_CARD = 4;

export interface FollowableUsersState {
  totalFollowableUsers: PersonCardState[];
  appearedUsers: PersonCardState[];
  nextIndex: number;
}

export interface PersonCardState {
  userId: number;
  image: string;
  name: string;
  shortBio: string | null;
  followingStatus: "idle" | "followable" | "following" | "pending";
}

export interface UsersShowPayload {
  showType: "next" | "random";
}

const initialValue: FollowableUsersState = {
  totalFollowableUsers: [],
  appearedUsers: [],
  nextIndex: NUMBER_SHOWN_CARD,
};

const recommendUserListSlice = createSlice({
  name: "recommendUserList",
  initialState: initialValue,
  reducers: {
    showOtherUsers(state, action: PayloadAction<UsersShowPayload>) {
      if (action.payload.showType == "random") {
        state.nextIndex = generateRandom(
          0,
          state.totalFollowableUsers.length - NUMBER_SHOWN_CARD
        );
      }
      if (state.nextIndex < state.totalFollowableUsers.length) {
        state.appearedUsers = state.totalFollowableUsers.slice(
          state.nextIndex,
          state.nextIndex + NUMBER_SHOWN_CARD
        );
        state.nextIndex += NUMBER_SHOWN_CARD;
      } else {
        state.appearedUsers = state.totalFollowableUsers.slice(
          0,
          NUMBER_SHOWN_CARD
        );
        state.nextIndex = NUMBER_SHOWN_CARD;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllExistedUsers.fulfilled, (state, action) => {
      state.totalFollowableUsers = action.payload;
      state.appearedUsers = action.payload.slice(0, NUMBER_SHOWN_CARD);
    });
    builder.addCase(makeFollowAUser.pending, (state, action) => {
      let targetUser = state.appearedUsers.find(
        (user) => user.userId == action.meta.arg.followingId
      );
      if (targetUser != null) {
        targetUser.followingStatus = "pending";
      }
    }),
      builder.addCase(makeFollowAUser.fulfilled, (state, action) => {
        let targetUser = state.totalFollowableUsers.find(
          (user) => user.userId == action.payload.following_id
        );
        if (targetUser != null) {
          targetUser.followingStatus = "following";
        }

        // because appear user list state is different from total user list.
        targetUser = state.appearedUsers.find(
          (user) => user.userId == action.payload.following_id
        );
        if (targetUser != null) {
          targetUser.followingStatus = "following";
        }
      }),
      builder.addCase(makeUnfollowAUser.pending, (state, action) => {
        let targetUser = state.appearedUsers.find(
          (user) => user.userId == action.meta.arg.followingId
        );
        if (targetUser != null) {
          targetUser.followingStatus = "pending";
        }
      }),
      builder.addCase(makeUnfollowAUser.fulfilled, (state, action) => {
        let targetUser = state.totalFollowableUsers.find(
          (user) => user.userId == action.payload.following_id
        );
        if (targetUser != null) {
          targetUser.followingStatus = "followable";
        }

        // because appear user list state is different from total user list.
        targetUser = state.appearedUsers.find(
          (user) => user.userId == action.payload.following_id
        );
        if (targetUser != null) {
          targetUser.followingStatus = "followable";
        }
      });
  },
});

export const fetchAllExistedUsers = createAsyncThunk(
  "followers/allExitedUsers",
  async (request: UserListRequestDto, thunkAPI) => {
    const data = await fetchAllUsers(request);
    const personCards: PersonCardState[] =
      convertUserListDtoToPersonCardStateList(data, request.sessionUserId);
    return personCards;
  }
);

const convertUserListDtoToPersonCardStateList = (
  data: UserListResponseDto,
  sessionUserId: number
): PersonCardState[] => {
  return data.user
    .filter((dto) => dto.id != sessionUserId)
    .map((dto) => ({
      userId: dto.id,
      image: dto.image,
      name: dto.user_name,
      shortBio: dto.short_bio,
      followingStatus:
        dto.followersByFollowerId[0]?.user_id == sessionUserId
          ? "following"
          : "followable",
    }));
};

export const makeFollowAUser = createAsyncThunk(
  "followers/makeFollowUser",
  async (request: FollowRequestDto, thunkAPI) => {
    const data = await makeAFollow(request);
    return data;
  }
);

export const makeUnfollowAUser = createAsyncThunk(
  "followers/makeUnfollowUser",
  async (request: FollowRequestDto, thunkAPI) => {
    const data = await makeAnUnfollow(request);
    return data;
  }
);
export const { showOtherUsers } = recommendUserListSlice.actions;

export default recommendUserListSlice.reducer;
