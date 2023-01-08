import { hasuraAxios } from "utils/axios/axios";
import { PostsByServiceIdReqDto, PostsByServiceIdResDto } from "./interfaces";

export const getPostsByServiceId = async (
  request: PostsByServiceIdReqDto
): Promise<PostsByServiceIdResDto> => {
  try {
    const response = await hasuraAxios.get("/posts/services/one", {
      params: { ...request },
    });

    if (response.status != 200) {
      throw Error(
        "Can not fetch user posts by service id: " + request.service_id
      );
    }

    const data = response.data as PostsByServiceIdResDto;

    return data;
  } catch (error) {
    console.error(error);
    throw Error(
      "Can not fetch user posts by service id: " + request.service_id
    );
  }
};

export const serviceApi = {
  getPostsByServiceId,
};
