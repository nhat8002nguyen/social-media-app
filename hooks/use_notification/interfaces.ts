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
