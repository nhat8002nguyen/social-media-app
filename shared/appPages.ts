const appPages = {
  home: "/",
  user: "/user/",
  profile: "/profile/",
  language: "/language/",
  logout: "/logout/",
  pages: "/pages/",
  trending: "/trending/",
  people: "/people/",
  post: "/post/",
};

export default appPages;

export interface GetPathOfPostPageWithComment {
  userId: number;
  postId: number;
  commentId: number;
  threadId: number;
}

export const getPathOfPostPageWithComment = ({
  userId,
  postId,
  commentId,
  threadId,
}: GetPathOfPostPageWithComment) => {
  return (
    appPages.user +
    userId +
    appPages.post +
    postId +
    "/comment_thread/" +
    threadId +
    "/comment/" +
    commentId
  );
};
