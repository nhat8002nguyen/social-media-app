import { AppPageLoading } from "@/components/atoms/AppLoading";
import NavigationBar, {
  homeActiveTabs,
} from "@/components/home/navigation_bar";
import EvaluationPost from "@/components/home/post";
import RecommendFollowableUsers from "@/components/home/recommendFollowableUsers";
import UserStatusInput from "@/components/home/userStatusInput";
import Container from "@/components/mocules/container";
import appPages from "@/shared/appPages";
import { serviceApi } from "apis/service";
import { PostsByServiceIdReqDto } from "apis/service/interfaces";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { PostListState, PostState } from "redux/slices/home/posts/interfaces";
import { setPostsList } from "redux/slices/home/posts/postListSlice";
import { convertPostListDtoToPostListState } from "redux/slices/home/posts/postsConverter";
import { RootState, useAppDispatch } from "redux/store/store";
import styles from "./styles.module.css";

export default function ServicePage({
  posts: initialPosts,
}: ServicePageGetServerSideProps) {
  const dispatch = useAppDispatch();

  const { posts }: PostListState = useSelector(
    (state: RootState) => state.postList
  );

  useEffect(() => {
    dispatch(setPostsList(initialPosts));
  }, [initialPosts]);

  return (
    <Container page={appPages.service}>
      <NavigationBar tabs={homeActiveTabs} type="APP" />
      <UserStatusInput />
      <RecommendFollowableUsers />
      <div className={styles.listPost}>
        {posts.length == 0 ? (
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

export interface ServicePageGetServerSideProps {
  posts?: PostState[];
}

export const getServerSideProps: GetServerSideProps<
  ServicePageGetServerSideProps
> = async (context: GetServerSidePropsContext) => {
  const posts = await getPostsOfServicePageFromContext(context);

  return {
    props: {
      posts,
    },
  };
};

export const getPostsOfServicePageFromContext = async (
  context: GetServerSidePropsContext
) => {
  const sessionUserId = context.params.sessionUserId;
  const id = context.params.id;

  const request: PostsByServiceIdReqDto = {
    service_id: parseParamToInt(id),
    session_user_id: parseParamToInt(sessionUserId),
  };

  const data = await serviceApi.getPostsByServiceId(request);

  const posts = convertPostListDtoToPostListState({
    postListDto: data.evaluation_post,
    sessionUserId: parseParamToInt(sessionUserId),
  });

  return posts;
};

const parseParamToInt = (id: string | string[]) => {
  return typeof id == "string" ? parseInt(id) : parseInt(id[0]);
};
