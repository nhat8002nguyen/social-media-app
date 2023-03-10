import { PostState } from "redux/slices/home/posts/interfaces";
import { PostDeletionState } from "redux/slices/home/posts/postFormSlice";
import { hasuraAxios } from "utils/axios/axios";
import {
  PostLikeResponseDto,
  PostListRequestDto,
  PostListResponseDto,
  PostShareResponseDto,
  PostsSharedByFollowingsResDto,
  SinglePostRequestDto,
  SinglePostResponseDto,
  TrendingPostsRequestDto,
  TrendingPostsResponseDto,
  UsedProofReqDto,
  UsedProofResDto,
} from "./interfaces";

export const fetchNewsFeedOfUser = async (
  request: PostListRequestDto
): Promise<PostListResponseDto> => {
  try {
    const response = await hasuraAxios.get("/posts/news-feed", {
      params: {
        user_id: request.userId,
        offset: request.followingOffset ?? 0,
        limit: request.followingLimit ?? 1,
        my_offset: request.ownerOffset ?? 0,
        my_limit: request.ownerLimit ?? 1,
      },
    });
    if (response.status === 200 && response.data.user?.length > 0) {
      return response.data;
    }
    return;
  } catch (e) {
    console.error(e);
  }
};

export const updatePostsInteractionsStatusOfSessionUser = async (request: {
  userId: number;
  posts: PostState[];
}): Promise<PostState[]> => {
  const { userId, posts } = request;
  try {
    const likeUpdatedPosts = await updateLikeStatus(userId, posts);

    const shareUpdatedPosts = await updateShareStatus(userId, likeUpdatedPosts);

    return shareUpdatedPosts;
  } catch (err) {
    throw Error("Can not update interaction status, please check api call");
  }
};

const updateLikeStatus = async (
  userId: number,
  posts: PostState[]
): Promise<PostState[]> => {
  const likedPostIds = [];
  for (let i = 0; i < posts.length; i++) {
    const res = await hasuraAxios.get("/likes/single-like", {
      params: {
        user_id: userId,
        post_id: posts[i].id,
      },
    });
    const data = res.data as PostLikeResponseDto;
    if (data.post_like.length) {
      likedPostIds.push(data.post_like[0].post_id);
    }
  }

  const updatedPosts = posts.map((post) => {
    return likedPostIds.includes(post.id)
      ? { ...post, isLiked: true }
      : { ...post };
  });
  return updatedPosts;
};

const updateShareStatus = async (
  userId: number,
  posts: PostState[]
): Promise<PostState[]> => {
  const sharedPostIds = [];
  for (let i = 0; i < posts.length; i++) {
    const res = await hasuraAxios.get("/shares/single-share", {
      params: {
        user_id: userId,
        post_id: posts[i].id,
      },
    });
    const data = res.data as PostShareResponseDto;
    if (data.post_share.length) {
      sharedPostIds.push(data.post_share[0].post_id);
    }
  }

  const updatedPosts = posts.map((post) => {
    return sharedPostIds.includes(post.id)
      ? { ...post, isShared: true }
      : { ...post };
  });
  return updatedPosts;
};

export const getTrendingPosts = async (
  request: TrendingPostsRequestDto
): Promise<TrendingPostsResponseDto> => {
  try {
    const response = await hasuraAxios.get("/posts/trending", {
      params: {
        ...request,
      },
    });
    const data = response.data as TrendingPostsResponseDto;
    if (response.status === 200) {
      return data;
    }

    throw Error("Can not fetch trending posts, please check api call");
  } catch (e) {
    console.error(e);
  }
};

interface PostDeletionResponseDto {
  delete_evaluation_post: {
    returning: {
      id: number;
    }[];
  };
}

export const deleteEvaluationPost = async (
  deletion: PostDeletionState
): Promise<PostDeletionResponseDto> => {
  const response = await hasuraAxios.delete("/posts", {
    params: {
      user_id: deletion.userId,
      post_id: deletion.postId,
    },
  });
  if (response.status == 200) {
    if (
      (response.data as PostDeletionResponseDto).delete_evaluation_post
        .returning.length > 0
    ) {
      return response.data;
    } else {
      throw Error("Delete a post fail");
    }
  }
};

export const fetchPostsSharedByFollowings = async (request: {
  user_id: number;
}): Promise<PostsSharedByFollowingsResDto> => {
  try {
    const res = await hasuraAxios.get("/posts/user/followings/shareds", {
      params: {
        ...request,
      },
    });

    const data = res.data as PostsSharedByFollowingsResDto;

    if (res.status != 200 || data.user.length == 0) {
      throwfetchPostsSharedByFollowingsError();
    }

    return data;
  } catch (error) {
    throwfetchPostsSharedByFollowingsError();
  }
};

const throwfetchPostsSharedByFollowingsError = () => {
  throw Error(
    "Something is wrong when get posts shared by following, please check api call"
  );
};

export const getEvaluationPost = async (
  request: SinglePostRequestDto
): Promise<SinglePostResponseDto> => {
  try {
    const res = await hasuraAxios.get("/posts/single", {
      params: {
        ...request,
      },
    });

    const data = res.data as SinglePostResponseDto;

    if (res.status != 200 || data.evaluation_post.length == 0) {
      throw Error("Failed to get a post with id: " + request.post_id);
    }

    return data;
  } catch (error) {
    throw Error("Failed to get a post with id: " + request.post_id);
  }
};

export const getVerifiedStatus = async (
  request: UsedProofReqDto[]
): Promise<UsedProofResDto[]> => {
  try {
    const reses = [];
    for (let i = 0; i < request.length; i++) {
      const res = await hasuraAxios.get("/proofs/one", {
        params: { ...request[i] },
      });
      reses.push(res);
    }

    const data = reses.map((res) => res.data as UsedProofResDto);

    if (reses[0]?.status != 200) {
      throw Error("Failed to get used proof of posts (1): " + request);
    }

    return data;
  } catch (error) {
    throw Error("Failed to get used proof of posts (2): " + request);
  }
};

export default {
  fetchNewsFeedOfUser,
  getTrendingPosts,
  deleteEvaluationPost,
  fetchPostsSharedByFollowings,
  getEvaluationPost,
};
