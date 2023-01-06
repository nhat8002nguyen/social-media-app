import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { PostState } from "redux/slices/home/posts/interfaces";
import EvaluationPostPage, { getPostsOfPostPageFromContext } from "../../..";

export default function PostPageWithComment({
  posts,
  commentId,
  threadId,
}: PostPageWithCommentGetServerSideProps) {
  return (
    <EvaluationPostPage
      posts={posts}
      commentId={commentId}
      commentThreadId={threadId}
    />
  );
}

export interface PostPageWithCommentGetServerSideProps {
  posts?: PostState[];
  threadId: number;
  commentId: number;
}

export const getServerSideProps: GetServerSideProps<
  PostPageWithCommentGetServerSideProps
> = async (context: GetServerSidePropsContext) => {
  const commentId = context.params.commentId;
  const threadId = context.params.threadId;

  const posts = await getPostsOfPostPageFromContext(context);

  return {
    props: {
      posts,
      commentId: parseParamToInt(commentId),
      threadId: parseParamToInt(threadId),
    },
  };
};

const parseParamToInt = (id: string | string[]) => {
  return typeof id == "string" ? parseInt(id) : parseInt(id[0]);
};
