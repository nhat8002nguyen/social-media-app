import appPages, { getPathOfPostPageWithComment } from "@/shared/appPages";
import { SubscriptionResult, gql, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { RootState } from "redux/store/store";
import {
  CommentsSubReqDto,
  CommentsSubResDto,
  FeedSubscriptionReqDto,
  FeedSubsriptionHookResult,
  NotificationHookProps,
} from "./interfaces";

export interface NotificationTileProps {
  id?: number | string;
  title1: string;
  title2: string;
  description: string;
  dateTime: string;
  path?: string;
  index?: number;
}

const NOTI_LIMIT = 4;
const POSTS_NOTI_LIMIT = NOTI_LIMIT / 2;
const COMMENTS_NOTI_LIMIT = NOTI_LIMIT / 2;

export default function useNotification({ feedProps }: NotificationHookProps) {
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  const [notifications, setNotifications] = useState<
    Array<NotificationTileProps>
  >([]);

  const {
    data: feedSubData,
    loading: feedSubLoading,
  }: FeedSubsriptionHookResult = useSubscription(FEED_SUBSCRIPTION, {
    variables: {
      user_id: session?.user.DBID,
      offset: feedProps ? feedProps.offset : 0,
      limit: feedProps ? feedProps.limit : 1,
      my_offset: feedProps ? feedProps.my_offset : 0,
      my_limit: feedProps ? feedProps.my_limit : 1,
    } as FeedSubscriptionReqDto,
  });

  useEffect(() => {
    if (!feedSubData || feedSubData.user.length == 0) {
      return;
    }

    let result: Array<NotificationTileProps> = [];

    feedSubData.user[0]?.followers.forEach((f) => {
      result = result.concat(
        f.following_user.evaluation_posts.map(
          (item) =>
            ({
              id: item.id,
              title1: "New post from " + item.post_owner.user_name,
              title2: item.title,
              description: item.body,
              dateTime: item.created_at,
              path:
                appPages.user +
                (session?.user.DBID ? session.user.DBID : 0) +
                appPages.post +
                item.id,
            } as NotificationTileProps)
        )
      );
    });

    result = sortByDateTimeDesc(result).slice(0, POSTS_NOTI_LIMIT);

    setNotifications((prev) => {
      if (prev.length > NOTI_LIMIT / 2) {
        result = !prev.find((noti) => noti.id === result[0]?.id)
          ? [result[0]]
          : [];
      }
      return sortByDateTimeDesc([...prev, ...result]).slice(0, NOTI_LIMIT);
    });
  }, [feedSubData]);

  const {
    data: commentsSubData,
    loading: commentsSubLoading,
  }: SubscriptionResult<CommentsSubResDto> = useSubscription(
    COMMENTS_SUBSCRIPTION,
    {
      variables: {
        user_id: session?.user.DBID,
      } as CommentsSubReqDto,
    }
  );

  useEffect(() => {
    if (!commentsSubData) {
      return;
    }

    let result: Array<NotificationTileProps> = [];

    commentsSubData.evaluation_post.forEach((post) => {
      result = result.concat(
        post.post_comments
          .filter((com) => com.user.id !== session?.user.DBID)
          .map(
            (com) =>
              ({
                id: com.id,
                title1: "Your post: " + post.title ?? "No title",
                title2: com.user.user_name + " just commented",
                description: com.text,
                dateTime: com.created_at,
                path: getPathOfPostPageWithComment({
                  userId: session?.user.DBID,
                  postId: post.id,
                  threadId: com.thread_id,
                  commentId: com.id,
                }),
              } as NotificationTileProps)
          )
      );
    });

    result = sortByDateTimeDesc(result).slice(0, COMMENTS_NOTI_LIMIT);

    setNotifications((prev) => {
      // Just add lastest noti after the initial notis was displayed
      if (prev.length > NOTI_LIMIT / 2) {
        result = !prev.find((noti) => noti.id === result[0]?.id)
          ? [result[0]]
          : [];
      }
      return sortByDateTimeDesc([...prev, ...result]).slice(0, NOTI_LIMIT);
    });
  }, [commentsSubData]);

  return { notifications, feedSubLoading, commentsSubLoading };
}

const sortByDateTimeDesc = (items: Array<NotificationTileProps>) => {
  items.sort(
    (a, b) => new Date(b.dateTime).valueOf() - new Date(a.dateTime).valueOf()
  );
  return items;
};

const FEED_SUBSCRIPTION = gql`
  subscription subscribeNewsFeed(
    $offset: Int = 0
    $limit: Int = 10
    $user_id: Int
    $my_offset: Int = 0
    $my_limit: Int = 5
  ) {
    user(where: { id: { _eq: $user_id } }) {
      followers {
        following_user {
          evaluation_posts(
            offset: $offset
            limit: $limit
            order_by: { updated_at: desc, created_at: desc }
          ) {
            id
            title
            body
            post_owner {
              id
              image
              user_name
              short_bio
            }
            created_at
            post_hotel {
              id
              name
            }
          }
        }
      }
      evaluation_posts(
        offset: $my_offset
        limit: $my_limit
        order_by: { updated_at: desc, created_at: desc }
      ) {
        id
        title
        body
        post_owner {
          id
          image
          user_name
          short_bio
        }
        created_at
        post_hotel {
          id
          name
        }
      }
    }
  }
`;

const COMMENTS_SUBSCRIPTION = gql`
  subscription get2LastCommentsOfAllPosts(
    $user_id: Int!
    $post_comment_limit: Int = 2
  ) {
    evaluation_post(where: { user_id: { _eq: $user_id } }) {
      title
      id
      hotel
      post_comments(
        limit: $post_comment_limit
        order_by: { created_at: desc }
      ) {
        id
        text
        post_id
        thread_id
        user {
          user_name
          id
        }
        created_at
      }
    }
  }
`;
