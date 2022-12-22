import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import search from "apis/search";
import { SearchRequestDto } from "apis/search/interfaces";
import { HotelSearchList } from "./interfaces";

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

export default hotelSearchSlice.reducer;

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
