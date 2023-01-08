import { AppPageLoading } from "@/components/atoms/AppLoading";
import NavigationBar, {
  homeActiveTabs,
} from "@/components/home/navigation_bar";
import EvaluationPost from "@/components/home/post";
import RecommendFollowableUsers from "@/components/home/recommendFollowableUsers";
import UserStatusInput from "@/components/home/userStatusInput";
import Container from "@/components/mocules/container";
import useForceSignIn from "@/hooks/useForceSignIn";
import appPages from "@/shared/appPages";
import { getHtmlCommentId } from "@/shared/utils/home";
import { SinglePostRequestDto } from "apis/home/interfaces";
import postListAPI from "apis/home/postListAPI";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { fetchCommentsByPostID } from "redux/slices/home/comments/commentsSlice";
import { PostListState, PostState } from "redux/slices/home/posts/interfaces";
import { setPostsList } from "redux/slices/home/posts/postListSlice";
import { convertPostListDtoToPostListState } from "redux/slices/home/posts/postsConverter";
import { RootState, useAppDispatch } from "redux/store/store";
import styles from "./styles.module.css";

export default function EvaluationPostPage({
  posts: initialPosts,
  commentId,
  commentThreadId,
}: PostPageGetServerSideProps) {
  const dispatch = useAppDispatch();
  useForceSignIn();

  const { posts }: PostListState = useSelector(
    (state: RootState) => state.postList
  );

  useEffect(() => {
    dispatch(setPostsList(initialPosts));
  }, [initialPosts]);

  // Scroll to specific comment if its id is specified in the route path
  useEffect(() => {
    if (posts.length > 0 && commentId && commentThreadId) {
      dispatch(fetchCommentsByPostID({ postId: posts[0].id })).then(() => {
        const commentElement = document.getElementById(
          // Not yet implement openning replies here, so just navigate to the parent comment.
          getHtmlCommentId(
            posts[0].id,
            commentThreadId > 0 ? commentThreadId : commentId
          )
        );

        commentElement &&
          window.scrollTo(commentElement.offsetLeft, commentElement.offsetTop);
      });
    }
  }, [posts, commentId, commentThreadId]);

  return (
    <Container page={appPages.home}>
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

export interface PostPageGetServerSideProps {
  posts?: PostState[];
  commentId?: number;
  commentThreadId?: number;
}

export const getServerSideProps: GetServerSideProps<
  PostPageGetServerSideProps
> = async (context: GetServerSidePropsContext) => {
  const posts = await getPostsOfPostPageFromContext(context);

  return {
    props: {
      posts,
    },
  };
};

export const getPostsOfPostPageFromContext = async (
  context: GetServerSidePropsContext
) => {
  const id = context.params.id;
  const sessionUserId = context.params.sessionUserId;

  const request: SinglePostRequestDto = {
    post_id: parseParamToInt(id),
    user_id: parseParamToInt(sessionUserId),
  };

  const data = await postListAPI.getEvaluationPost(request);

  const posts = convertPostListDtoToPostListState({
    postListDto: data.evaluation_post,
    sessionUserId: parseParamToInt(sessionUserId),
  });

  return posts;
};

const parseParamToInt = (id: string | string[]) => {
  return typeof id == "string" ? parseInt(id) : parseInt(id[0]);
};
