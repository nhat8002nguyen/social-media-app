import { PostDeletionState } from "redux/slices/home/posts/postFormSlice";
import { PostState } from "redux/slices/home/posts/postListSlice";
import { hasuraAxios } from "utils/axios/axios";
import {
  PostLikeResponseDto,
  PostListRequestDto,
  PostListResponseDto,
  TrendingPostsRequestDto,
  TrendingPostsResponseDto,
} from "./interfaces";

export const fetchNewsFeedOfUser = async (
  request: PostListRequestDto
): Promise<PostListResponseDto> => {
  try {
    const response = await hasuraAxios.get("/posts/news-feed", {
      params: {
        user_id: request.userId,
        offset: request.followingOffset ?? 0,
        limit: request.followingLimit ?? 2,
        my_offset: request.ownerOffset ?? 0,
        my_limit: request.ownerLimit ?? 2,
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
  } catch (err) {
    throw Error("Can not update interaction status, please check api call");
  }
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
    throw Error("Can not fetch trending posts, please check api call");
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

export default {
  fetchNewsFeedOfUser,
  getTrendingPosts,
  deleteEvaluationPost,
};
