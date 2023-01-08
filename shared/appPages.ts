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
  service: "/service/",
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

export const getPathOfProfilePageWithId = (
  sUserId: number,
  profileId: number
) => {
  return appPages.user + sUserId + appPages.profile + profileId;
};

export const getPathOfPostPageWithId = (sUserId: number, postId: number) => {
  return appPages.user + sUserId + appPages.post + postId;
};

export const getPathOfServicePageWithId = (
  sUserId: number,
  serviceId: number
) => {
  return appPages.user + sUserId + appPages.service + serviceId;
};
