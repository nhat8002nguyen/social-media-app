import appPages from "@/shared/appPages";
import { gql, useSubscription } from "@apollo/client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { RootState } from "redux/store/store";
import { FeedSubsriptionHookResult, NotificationHookProps } from "./interfaces";

export interface NotificationTileProps {
  id?: number | string;
  title1: string;
  title2: string;
  description: string;
  dateTime: string;
  path?: string;
}

export default function useNotification({ feedProps }: NotificationHookProps) {
  const { session }: AuthState = useSelector((state: RootState) => state.auth);

  const [notifications, setNotifictions] = useState<
    Array<NotificationTileProps>
  >([]);

  const { data: feedSubData, loading }: FeedSubsriptionHookResult =
    useSubscription(FEED_SUBSCRIPTION, {
      variables: {
        user_id: session?.user.DBID,
        offset: feedProps ? feedProps.offset : 0,
        limit: feedProps ? feedProps.limit : 1,
        my_offset: feedProps ? feedProps.my_offset : 0,
        my_limit: feedProps ? feedProps.my_limit : 1,
      },
    });

  useEffect(() => {
    if (!feedSubData || feedSubData.user.length == 0) {
      return;
    }

    let result: Array<
      FeedSubsriptionHookResult["data"]["user"][number]["followers"][number]["following_user"]["evaluation_posts"][number]
    > = [];

    feedSubData.user[0]?.followers.forEach((f) => {
      result = result.concat(f.following_user.evaluation_posts);
    });

    setNotifictions(() => {
      return result
        .map(
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
        .sort(
          (a, b) =>
            new Date(b.dateTime).valueOf() - new Date(a.dateTime).valueOf()
        )
        .slice(0, 4);
    });
  }, [feedSubData]);

  return { notifications, loading };
}

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
