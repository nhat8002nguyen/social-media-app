import { TrendingPostsRequestDto } from "apis/home/interfaces";
import postListAPI from "apis/home/postListAPI";
import { GetServerSideProps } from "next";
import { convertPostListDtoToPostListState } from "redux/slices/home/posts/postsConverter";
import Home, { HomeGetServerSideProps } from "./home";

export default function ServiceSocialMediaApp({
  posts,
}: HomeGetServerSideProps) {
  return <Home posts={posts} />;
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
