import { AxiosResponse } from "axios";
import { randomUUID } from "crypto";
import { cloudinaryAxios, hasuraAxios } from "utils/axios/axios";
import { PostFormDetailState } from "../../redux/slices/home/posts/postFormSlice";
import {
  EvaluationPostDto,
  PostImageDto,
  ServiceUsedProofInsertionResDto,
} from "./interfaces";

export interface PostInsertionResponseDto {
  insert_evaluation_post: PostMutationDto;
}

export interface PostUpdationResponseDto {
  update_evaluation_post: PostMutationDto;
}

export interface PostMutationDto {
  returning: Array<EvaluationPostDto>;
}

export interface ImagesSavingCloudinaryDto {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: Array<string>;
  bytes: number;
  type: string;
  etag: string;
  placeholder: false;
  url: string;
  secure_url: string;
  folder: string;
  access_mode: string;
  original_filename: string;
}

export interface PostImageInsertionDto {
  insert_post_image: InsertPostImageDto;
}

export interface InsertPostImageDto {
  returning: PostImageReturningDto[];
}

export interface PostImageReturningDto {
  id: number;
  post: number;
  url: string;
}

export interface PostImagesDeletionDto {
  delete_post_image: PostImagesMutationDto;
}

export interface PostImagesMutationDto {
  returning: IDDto[];
}

export interface IDDto {
  id: number;
}

export const saveEvaluationPost = async (
  post: PostFormDetailState
): Promise<EvaluationPostDto> => {
  if (post.proofImages.length > 0 && post.hotel != null) {
    const savedProofImages = await saveImagesToCloudinary(post.proofImages);
    const pureUsedProofRes = await saveServiceUsedProofWithoutImages(post);
    await saveProofImageRefsToDBIFHave(
      post,
      pureUsedProofRes,
      savedProofImages
    );
  }

  // Accept that if transaction is unfortunately fail,
  // the images will be rundundant in the cloud
  const imagesSavingRes = await saveImagesToCloudinary(post.images);

  const purePostRes = await saveEvaluationPostWithoutImages(post);

  if (purePostRes.status == 200) {
    const postImagesSavingRes = await savePostImageRefsToDBIfHave(
      post,
      purePostRes,
      imagesSavingRes
    );
    return postImagesSavingRes;
  }
};

const saveProofImageRefsToDBIFHave = async (
  post: PostFormDetailState,
  pureUsedProofRes: AxiosResponse,
  imagesSavingResponses: AxiosResponse[]
) => {
  if (post.proofImages.length == 0) {
    return;
  } else if (
    post.proofImages.length > 0 &&
    imagesSavingResponses[0].status == 200
  ) {
    const pureUsedProofData =
      pureUsedProofRes.data as ServiceUsedProofInsertionResDto;
    const proofId = pureUsedProofData.insert_service_used_proof_one.id;
    if (proofId != null) {
      const imagesSavingDtos = imagesSavingResponses.map(
        (res) => res.data as ImagesSavingCloudinaryDto
      );
      await addProofImageReferencesToDB(pureUsedProofData, imagesSavingDtos);
    }
  }
};

const addProofImageReferencesToDB = async (
  pureUsedProofData: ServiceUsedProofInsertionResDto,
  imagesSavingDtos: ImagesSavingCloudinaryDto[]
) => {
  try {
    const proof = pureUsedProofData.insert_service_used_proof_one;

    const proofId = proof.id;

    const imageReferencesPromises = imagesSavingDtos.map((dto) => {
      return hasuraAxios.post("/proof-images", null, {
        params: {
          proof_id: proofId,
          url: dto.url,
        },
      });
    });
    return await Promise.all(imageReferencesPromises);
  } catch (err) {
    console.error(err);
    throw Error(
      "Can add proof image to DB, please check addProofImageReferencesDB api call"
    );
  }
};

const savePostImageRefsToDBIfHave = async (
  post: PostFormDetailState,
  purePostRes: AxiosResponse,
  imagesSavingResponses: AxiosResponse[]
): Promise<EvaluationPostDto> => {
  if (post.images.length == 0) {
    return purePostRes.data;
  } else if (post.images.length > 0 && imagesSavingResponses[0].status == 200) {
    const purePostResData = purePostRes.data as PostInsertionResponseDto;
    const postId = purePostResData.insert_evaluation_post.returning[0].id;
    if (postId != null) {
      const imagesSavingDtos = imagesSavingResponses.map(
        (res) => res.data as ImagesSavingCloudinaryDto
      );
      const imageRefsResponses = await addImageReferencesToDB(
        purePostResData,
        imagesSavingDtos
      );
      if (imageRefsResponses[0]?.status == 200) {
        return combinePostWithImages(
          purePostRes.data,
          imageRefsResponses.map((res) => res.data as PostImageInsertionDto)
        );
      }
    }
  }
};

const saveEvaluationPostWithoutImages = async (post: PostFormDetailState) => {
  try {
    const purePostRes = await hasuraAxios.post("/posts", null, {
      params: {
        user_id: post.userId,
        title: post.title,
        body: post.body,
        hotel: post.hotel,
        location_rating: post.locationRating,
        cleanliness_rating: post.cleanlinessRating,
        service_rating: post.serviceRating,
        value_rating: post.valueRating,
      },
    });
    return purePostRes;
  } catch (err) {
    throw Error("Can not save post to DB");
  }
};

const saveServiceUsedProofWithoutImages = async (post: PostFormDetailState) => {
  try {
    const pureUsedProofRes = await hasuraAxios.post("/proofs", null, {
      params: {
        user_id: post.userId,
        hotel_id: post.hotel,
      },
    });
    return pureUsedProofRes;
  } catch (err) {
    throw Error("Can not save post to DB");
  }
};

const saveImagesToCloudinary = async (images: File[]) => {
  try {
    const imagesSavingPromises = images.map((image) => {
      let formData = new FormData();
      formData.append("file", image);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );
      formData.append("public_id", image.name + "-" + randomUUID);
      formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
      return cloudinaryAxios.post("/:resource_type/upload", formData, {
        params: { resource_type: "image" },
      });
    });

    const imagesSavingResponses = await Promise.all(imagesSavingPromises);

    return imagesSavingResponses;
  } catch (err) {
    console.error(err);
    throw Error("Can not upload images to cloudinary, please try again !");
  }
};

const addImageReferencesToDB = async (
  postData: PostInsertionResponseDto | PostUpdationResponseDto,
  imageSavingDtos: Array<ImagesSavingCloudinaryDto>
) => {
  try {
    const post =
      "insert_evaluation_post" in postData
        ? postData.insert_evaluation_post.returning[0]
        : postData.update_evaluation_post.returning[0];
    const postId = post.id;
    const userId = post.post_owner.id;
    const serviceId = post.post_hotel?.id;

    const imageReferencesPromises = imageSavingDtos.map((dto) => {
      return hasuraAxios.post("/posts/images", null, {
        params: {
          post_id: postId,
          url: dto.url,
          user_id: userId,
          service_id: serviceId,
        },
      });
    });
    return await Promise.all(imageReferencesPromises);
  } catch (err) {
    console.error(err);
    throw Error("Can add image to DB please try again !");
  }
};

const combinePostWithImages = (
  postDto: EvaluationPostDto,
  imageRefs: PostImageInsertionDto[]
): EvaluationPostDto => {
  const postImages = imageRefs.map(
    (image) =>
      ({
        id: image.insert_post_image.returning[0].id,
        url: image.insert_post_image.returning[0].url,
      } as PostImageDto)
  );
  postDto.post_images = postImages;
  return postDto;
};

export const updateEvaluationPost = async (
  post: PostFormDetailState
): Promise<EvaluationPostDto> => {
  const imagesSavingResponses = await saveImagesToCloudinary(post.images);

  // Note that in hasura it will return 200 for updating no post.
  // So we should check the returning value.
  const purePostRes = await updatePurePost(post);
  const purePostData = purePostRes.data as PostUpdationResponseDto;

  if (purePostData.update_evaluation_post.returning.length == 0) {
    throw Error("No post is updated");
  }

  // if user want to replace with the new images, sync their references to DB
  if (
    post.images.length > 0 &&
    imagesSavingResponses[0]?.status == 200 &&
    post.postId != null
  ) {
    await deleteImageRefsFromPost(post.postId);

    const cloudinaryImages = imagesSavingResponses.map(
      (res) => res.data as ImagesSavingCloudinaryDto
    );
    const imageRefsResponses = await addImageReferencesToDB(
      purePostData,
      cloudinaryImages
    );
    const imageRefs = imageRefsResponses.map(
      (res) => res.data as PostImageInsertionDto
    );
    return combinePostWithImages(
      purePostData.update_evaluation_post.returning[0],
      imageRefs
    );
  }

  return purePostData.update_evaluation_post.returning[0];
};

const updatePurePost = async (post: PostFormDetailState) => {
  try {
    const purePostRes = await hasuraAxios.put("/posts", null, {
      params: {
        user_id: post.userId,
        post_id: post.postId,
        title: post.title,
        body: post.body,
        hotel: post.hotel,
        location_rating: post.locationRating,
        cleanliness_rating: post.cleanlinessRating,
        service_rating: post.serviceRating,
        value_rating: post.valueRating,
      },
    });
    return purePostRes;
  } catch (err) {
    throw Error("Can not save post to DB");
  }
};

const deleteImageRefsFromPost = async (postId: number) => {
  try {
    const response = await hasuraAxios.delete("/images", {
      params: {
        post_id: postId,
      },
    });
    return response;
  } catch (err) {
    throw Error("Can not delete image refs from post: " + postId);
  }
};
