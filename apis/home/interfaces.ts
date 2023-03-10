import { ApiErrorResponse } from "@/shared/interfaces";

export interface UserListRequestDto {
  sessionUserId: number;
  limit?: number;
  offset?: number;
}

export interface UserListResponseDto {
  user: UserResponseDto[];
}

export interface UserResponseDto {
  id: number;
  user_name: string;
  image: string;
  short_bio: string | null;
  email: string;
  phone: string | null;
  about: string | null;
  google_account_id: string;
  updated_at: string;
  created_at: string;
  followersByFollowerId: FollowInfoResponseDto[];
}

export interface FollowInfoResponseDto {
  user_id: number;
  following_id: number;
  created_at: string;
}

export interface FollowRequestDto {
  userId: number;
  followingId: number;
}

export interface FollowsResponseDto {
  insert_follower: FollowReturningDto;
}

export interface FollowReturningDto {
  returning: FollowResponseDto[];
}

export interface FollowResponseDto {
  user_id: number;
  following_id: number;
  created_at: string;
}

export interface UnfollowResponseDto {
  delete_follower: FollowReturningDto;
}

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
  hotel: number | null;
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
  post_shares: {
    user_id: number;
    post_id: number;
    shared_at: string;
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

export interface PostLikeResponseDto {
  post_like: {
    user_id: number;
    post_id: number;
    liked_at: string;
  }[];
}

export interface PostShareResponseDto {
  post_share: {
    user_id: number;
    post_id: number;
    shared_at: string;
  }[];
}

export interface TrendingPostsRequestDto {
  offset?: number;
  limit?: number;
  min_like_count: number;
  min_comment_count: number;
  min_share_count: number;
}

export interface TrendingPostsResponseDto {
  evaluation_post: EvaluationPostDto[];
}

export interface PostsSharedByFollowingsReqDto {
  user_id: number;
  shared_limit?: number;
  offset?: number;
}

export interface PostsSharedByFollowingsResDto {
  user: {
    followers: {
      following_user: {
        id: number;
        user_name: string;
        post_shares: {
          post_id: number;
          shared_at: string;
          shared_posts: EvaluationPostDto;
        }[];
      };
    }[];
  }[];
}

export interface SinglePostRequestDto {
  post_id: number;
  user_id?: number;
  offset?: number;
  limit?: number;
}

export interface SinglePostResponseDto {
  evaluation_post: EvaluationPostDto[];
}

export interface ServiceUsedProofInsertionResDto {
  insert_service_used_proof_one: {
    id: number;
    user_id: number;
    hotel_id: number;
    verified: boolean;
    updated_at: string;
    created_at: string;
  };
}

export interface UsedProofReqDto {
  user_id: number;
  hotel_id: number;
}

export interface UsedProofResDto {
  service_used_proof: {
    id: number;
    user_id: number;
    hotel_id: number;
    verified: boolean;
    updated_at: string;
    created_at: string;
  }[];
}
