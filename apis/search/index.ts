import { hasuraAxios } from "utils/axios/axios";
import { HotelsSearchResponseDto, SearchRequestDto } from "./interfaces";

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

export default {
  searchHotels,
};
