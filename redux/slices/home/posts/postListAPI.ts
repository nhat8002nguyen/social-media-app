import { ApiErrorResponse } from "@/shared/interfaces";
import { hasuraAxios } from "utils/axios/axios";

export interface PostListRequestDto {
  userId: number;
  followingLimit?: number; // the limit post of a followed user
  followingOffset?: number;
  ownerLimit?: number;
  ownerOffset?: number;
}

export interface PostListResponseDto extends ApiErrorResponse {
  user: {
    followers: Array<FollowingUserDto>;
    evaluation_posts: Array<EvaluationPostDto>;
  }[];
}

export interface FollowingUserDto {
  following_user: EvaluationPostsDto;
}

export interface EvaluationPostsDto {
  evaluation_posts: Array<EvaluationPostDto>;
}

export interface EvaluationPostDto {
  id: number;
  title: string;
  body: string;
  post_owner: PostOwnerDto;
  post_images: Array<PostImageDto>;
  hote: number | null;
  location_rating: number;
  cleanliness_rating: number;
  service_rating: number;
  value_rating: number;
  created_at: string;
  updated_at: string;
  post_likes_aggregate: PostLikesAggregateDto;
  post_comments_aggregate: PostCommentsAggregateDto;
  post_shares_aggregate: PostSharesAggregateDto;
  post_likes: {
    user_id: number;
    post_id: number;
    liked_at: string;
  }[];
  post_hotel: PostHotelDto;
}

export interface PostOwnerDto {
  id: number;
  image: string | null;
  user_name: string;
  email: string;
  short_bio: string | null;
  created_at: string;
}

export interface PostImageDto {
  id: number;
  url: string;
}

export interface PostLikesAggregateDto {
  aggregate: Aggregate;
}

export interface PostCommentsAggregateDto {
  aggregate: Aggregate;
}

export interface PostSharesAggregateDto {
  aggregate: Aggregate;
}

export interface Aggregate {
  count: number;
}

export interface PostHotelDto {
  id: number;
  name: string;
  location: string;
  about: string;
  rating: number;
}

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
