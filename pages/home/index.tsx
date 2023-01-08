import { AppPageLoading } from "@/components/atoms/AppLoading";
import NavigationBar, {
  homeActiveTabs,
} from "@/components/home/navigation_bar";
import EvaluationPost from "@/components/home/post";
import RecommendFollowableUsers from "@/components/home/recommendFollowableUsers";
import UserStatusInput from "@/components/home/userStatusInput";
import Container from "@/components/mocules/container";
import useNewsFeed from "@/hooks/useNewsFeed";
import usePrefetchProfilePage from "@/hooks/usePrefetchProfilePage";
import { useRefreshNewsFeed } from "@/hooks/useRefreshNewsFeed";
import useFetchPostsOnScroll from "@/hooks/use_fetch_posts_on_scroll";
import appPages from "@/shared/appPages";
import { TrendingPostsRequestDto } from "apis/home/interfaces";
import postListAPI from "apis/home/postListAPI";
import { GetServerSideProps } from "next";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { PostListState, PostState } from "redux/slices/home/posts/interfaces";
import { convertPostListDtoToPostListState } from "redux/slices/home/posts/postsConverter";
import { RootState } from "redux/store/store";
import styles from "./styles.module.css";

export default function Home({ posts: initialPosts }: HomeGetServerSideProps) {
  const { syncDBStatus }: AuthState = useSelector(
    (state: RootState) => state.auth
  );
  const { posts, loading: postsLoading }: PostListState = useSelector(
    (state: RootState) => state.postList
  );

  useNewsFeed({ initialPosts });
  useRefreshNewsFeed();
  usePrefetchProfilePage({ ids: posts?.map((p) => p.postOwner.id) });
  useFetchPostsOnScroll();

  return (
    <Container page={appPages.home}>
      <NavigationBar tabs={homeActiveTabs} type="APP" />
      <UserStatusInput />
      <RecommendFollowableUsers />
      <div className={styles.listPost}>
        {postsLoading == "loading" || syncDBStatus == "pending" ? (
          <AppPageLoading />
        ) : (
          posts.map((post: PostState) => (
            <EvaluationPost key={post.id} postState={post} />
          ))
        )}
      </div>
    </Container>
  );
}

export interface HomeGetServerSideProps {
  posts?: PostState[];
}

export const getServerSideProps: GetServerSideProps<
  HomeGetServerSideProps
> = async () => {
  const request: TrendingPostsRequestDto = {
    offset: 0,
    limit: 10,
    min_like_count: 3,
    min_comment_count: 5,
    min_share_count: 3,
  };

  const data = await postListAPI.getTrendingPosts(request);

  const posts = convertPostListDtoToPostListState({
    postListDto: data?.evaluation_post,
  });

  return {
    props: {
      posts,
    },
  };
};
