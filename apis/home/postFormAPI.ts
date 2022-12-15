import { randomUUID } from "crypto";
import { cloudinaryAxios, hasuraAxios } from "utils/axios/axios";
import { PostFormDetailState } from "../../redux/slices/home/posts/postFormSlice";
import { EvaluationPostDto, PostImageDto } from "./interfaces";

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
  // Accept that if transaction is unfortunately fail,
  // the images will be rundundant in the cloud
  const imagesSavingResponses = await saveImagesToCloudinary(post.images);

  const purePostRes = await saveEvaluationPostWithoutImages(post);

  if (purePostRes.status == 200) {
    if (post.images.length == 0) {
      return purePostRes.data;
    } else if (
      post.images.length > 0 &&
      imagesSavingResponses[0].status == 200
    ) {
      const purePostResData = purePostRes.data as PostInsertionResponseDto;
      const postId = purePostResData.insert_evaluation_post.returning[0].id;
      if (postId != null) {
        const imagesSavingDtos = imagesSavingResponses.map(
          (res) => res.data as ImagesSavingCloudinaryDto
        );
        const imageRefsResponses = await addImageReferencesToDB(
          postId,
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
    throw Error("Can not upload images, please try again !");
  }
};

const addImageReferencesToDB = async (
  postId: number,
  imageSavingDtos: Array<ImagesSavingCloudinaryDto>
) => {
  try {
    const imageReferencesPromises = imageSavingDtos.map((dto) => {
      return hasuraAxios.post("/posts/images", null, {
        params: {
          post_id: postId,
          url: dto.url,
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
      post.postId,
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
