import { SubscriptionResult } from "@apollo/client";

export interface NotificationHookProps {
  feedProps?: FeedSubscriptionReqDto;
}

export interface FeedSubsriptionHookResult extends SubscriptionResult {
  data?: FeedSubscriptionResDto;
  loading: boolean;
}

export interface FeedSubscriptionReqDto {
  offset?: number;
  limit?: number;
  user_id: number;
  my_offset?: number;
  my_limit?: number;
}

export interface FeedSubscriptionResDto {
  user: Array<{
    followers: Array<{
      following_user: {
        evaluation_posts: Array<{
          id: number;
          title: string;
          body: string;
          post_owner: {
            id: number;
            image: string;
            user_name: string;
            short_bio: string;
          };
          created_at: string;
          post_hotel: {
            id: number;
            name: string;
          };
        }>;
      };
    }>;
    evaluation_posts: Array<{
      id: number;
      title: string;
      body: string;
      post_owner: {
        id: number;
        image: string;
        user_name: string;
        short_bio: string;
      };
      created_at: string;
      post_hotel: {
        id: number;
        name: string;
      };
    }>;
  }>;
}

export interface CommentsSubReqDto {
  user_id: number;
  post_comment_limit?: number;
}

export interface CommentsSubResDto {
  evaluation_post: Array<{
    id: number;
    title: string;
    hotel: number | null;
    post_comments: Array<{
      id: number;
      text: string;
      post_id: number;
      thread_id: number;
      user: {
        user_name: string;
        id: number;
      };
      created_at: string;
    }>;
  }>;
}
