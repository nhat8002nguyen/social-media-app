import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import search from "apis/search";
import { SearchRequestDto } from "apis/search/interfaces";
import {
  HotelSearchList,
  PostsSearchListState,
  UsersSearchListState,
} from "./interfaces";

const initialState: HotelSearchList = {
  hotels: [],
  searchStatus: "idle",
};

const hotelSearchSlice = createSlice({
  name: "hotelSearch",
  initialState: initialState,
  reducers: {
    clearHotelSearch(state, action) {
      state.hotels = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getHotelSearchList.pending, (state, action) => {
      state.searchStatus = "pending";
    });
    builder.addCase(getHotelSearchList.rejected, (state, action) => {
      state.searchStatus = "failed";
    });
    builder.addCase(getHotelSearchList.fulfilled, (state, action) => {
      state.hotels = action.payload;
      state.searchStatus = "succeeded";
    });
  },
});

export const { clearHotelSearch } = hotelSearchSlice.actions;

export const hotelSliceReducer = hotelSearchSlice.reducer;

export const getHotelSearchList = createAsyncThunk(
  "search/hotels",
  async (request: SearchRequestDto, thunkAPI) => {
    const data = await search.searchHotels(request);
    const hotels = data.search_hotels_with_limit.map((hotel) => {
      return {
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        created_at: hotel.created_at,
      } as HotelSearchList["hotels"][number];
    });
    return hotels;
  }
);

/* Search posts */
const initialPostsSearchState: PostsSearchListState = {
  posts: [],
  searchStatus: "idle",
};

const postSearchSlice = createSlice({
  name: "postSearch",
  initialState: initialPostsSearchState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPostSearchList.pending, (state, action) => {
      state.searchStatus = "pending";
    });
    builder.addCase(getPostSearchList.rejected, (state, action) => {
      state.searchStatus = "failed";
    });
    builder.addCase(getPostSearchList.fulfilled, (state, action) => {
      state.posts = action.payload;
      state.searchStatus = "succeeded";
    });
  },
});

export const postSearchSliceReducer = postSearchSlice.reducer;

export const getPostSearchList = createAsyncThunk(
  "search/posts",
  async (request: SearchRequestDto, thunkAPI) => {
    const data = await search.searchPosts(request);
    const posts = data.search_posts.map((post) => {
      return {
        id: post.id,
        title: post.title,
        body: post.body,
        hotel: post.hotel,
        createdAt: post.created_at,
        postOwner: {
          id: post.post_owner.id,
          username: post.post_owner.user_name,
          shortBio: post.post_owner.short_bio,
        },
      } as PostsSearchListState["posts"][number];
    });
    return posts;
  }
);

/* Search users */
const initialUsersSearchState: UsersSearchListState = {
  users: [],
  searchStatus: "idle",
};

const userSearchSlice = createSlice({
  name: "userSearch",
  initialState: initialUsersSearchState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserSearchList.pending, (state, action) => {
      state.searchStatus = "pending";
    });
    builder.addCase(getUserSearchList.rejected, (state, action) => {
      state.searchStatus = "failed";
    });
    builder.addCase(getUserSearchList.fulfilled, (state, action) => {
      state.users = action.payload;
      state.searchStatus = "succeeded";
    });
  },
});

export const userSearchSliceReducer = userSearchSlice.reducer;

export const getUserSearchList = createAsyncThunk(
  "search/users",
  async (request: SearchRequestDto, thunkAPI) => {
    const data = await search.searchUsers(request);
    const users = data.search_users.map((user) => {
      return {
        id: user.id,
        image: user.image,
        username: user.user_name,
        shortBio: user.short_bio,
        email: user.email,
        createdAt: user.created_at,
      } as UsersSearchListState["users"][number];
    });
    return users;
  }
);
