import { hasuraAxios } from "utils/axios/axios";
import {
  HotelsSearchResponseDto,
  PostsSearchResponseDto,
  SearchRequestDto,
  UsersSearchResponseDto,
} from "./interfaces";

export const searchHotels = async (request: SearchRequestDto) => {
  try {
    const res = await hasuraAxios.get("/search/hotels", {
      params: {
        ...request,
      },
    });

    const data = res.data as HotelsSearchResponseDto;

    if (res.status == 200) {
      return data;
    }

    throw Error("Can not execute search hotels, please check the api call");
  } catch (error) {
    throw Error("Can not execute search hotels, please check the api call");
  }
};

export const searchPosts = async (request: SearchRequestDto) => {
  try {
    const res = await hasuraAxios.get("/search/posts", {
      params: {
        ...request,
      },
    });

    const data = res.data as PostsSearchResponseDto;

    if (res.status == 200) {
      return data;
    }

    throw Error("Can not execute search posts, please check the api call");
  } catch (error) {
    throw Error("Can not execute search posts, please check the api call");
  }
};

export const searchUsers = async (request: SearchRequestDto) => {
  try {
    const res = await hasuraAxios.get("/search/users", {
      params: {
        ...request,
      },
    });

    const data = res.data as UsersSearchResponseDto;

    if (res.status == 200) {
      return data;
    }

    throw Error("Can not execute search users, please check the api call");
  } catch (error) {
    throw Error("Can not execute search users, please check the api call");
  }
};
export default {
  searchHotels,
  searchPosts,
  searchUsers,
};
