import { PostState } from "redux/slices/home/posts/postListSlice";
import { hasuraAxios } from "utils/axios/axios";
import {
  PostLikeResponseDto,
  PostListRequestDto,
  PostListResponseDto,
} from "./interfaces";

export const fetchNewsFeedOfUser = async (
  request: PostListRequestDto
): Promise<PostListResponseDto> => {
  try {
    const response = await hasuraAxios.get(
      "https://refined-baboon-56.hasura.app/api/rest/v1/posts/news-feed",
      {
        params: {
          user_id: request.userId,
          offset: request.followingOffset ?? 0,
          limit: request.followingLimit ?? 2,
          my_offset: request.ownerOffset ?? 0,
          my_limit: request.ownerLimit ?? 2,
        },
      }
    );
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
    const promises = posts.map((post) => {
      return hasuraAxios.get("/likes/single-like", {
        params: {
          user_id: userId,
          post_id: post.id,
        },
      });
    });

    const responses = await Promise.all(promises);

    const likedPostIds: number[] = [];
    responses.forEach((res) => {
      const data = res.data as PostLikeResponseDto;
      data.post_like.length > 0 && likedPostIds.push(data.post_like[0].post_id);
    });

    // likedPostIds.forEach((id) => {
    //   const post = posts.find((post) => post.id == id);
    //   if (post != null && post != undefined) {
    //     post.isLiked = true;
    //   }
    // });
    const updatedPosts = posts.map((post) => {
      return likedPostIds.includes(post.id)
        ? { ...post, isLiked: true }
        : { ...post };
    });

    console.log(updatedPosts);

    return updatedPosts;
  } catch (err) {
    throw Error("Can not update interactions status of session user");
  }
};
