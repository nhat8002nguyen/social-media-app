import { EvaluationPostDto } from "apis/home/interfaces";

export interface UserIdsResponseDto {
  user: {
    id: number;
  }[];
}

export interface UserSummaryFetchRequestDto {
  user_id: number;
  follower_show_limit: number;
  following_show_limit: number;
}

export interface UserSummaryFetchResponseDto {
  user: {
    id: number;
    image: string;
    user_name: string;
    short_bio: string;
    phone: string;
    about: string;
    email: string;
    updated_at: string;
    created_at: string;
    followersByFollowerId: {
      user_id: number;
      following_id: number;
      created_at: string;
      follower_info: {
        id: number;
        image: string;
        short_bio: string;
        user_name: string;
        created_at: string;
      };
    }[];
    followers: {
      created_at: string;
      following_user: {
        id: number;
        image: string;
        user_name: string;
        short_bio: string;
        created_at: string;
      };
    }[];
    followersByFollowerId_aggregate: {
      aggregate: {
        count: number;
      };
    };
    followers_aggregate: {
      aggregate: {
        count: number;
      };
    };
    evaluation_posts_aggregate: {
      aggregate: {
        count: number;
      };
    };
  }[];
}

export interface InteractedPostsRequestDto {
  user_id: number;
  session_user_id?: number;
  after_time?: string;
  offset?: number;
  limit?: number;
}

export interface LikedPostsResponseDto {
  post_like: {
    post_id: number;
    liked_at: string;
    liked_posts: EvaluationPostDto;
  }[];
}

export interface SharedPostsResponseDto {
  post_share: {
    post_id: number;
    shared_at: string;
    shared_posts: EvaluationPostDto;
  }[];
}

export interface ProfileSummaryUpdateRequestDto {
  user_id: number;
  user_name: string;
  short_bio: string;
  phone: string;
  about: string;
}

export interface ProfileSummaryUpdateResponseDto {
  update_user: {
    returning: {
      id: number;
      user_name: string;
      short_bio: string;
      phone: string;
      about: string;
      updated_at: string;
    }[];
  };
}
