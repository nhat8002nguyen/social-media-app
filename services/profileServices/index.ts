import { parseId } from "@/shared/utils/home";
import { ProfileSummaryFindReqDto } from "apis/profile/interfaces";
import profilePageAPI from "apis/profile/profilePageAPI";
import { PostState } from "redux/slices/home/posts/interfaces";
import postsConverter from "redux/slices/home/posts/postsConverter";
import {
  convertSummaryResponseToState,
  SummaryState,
} from "redux/slices/profile/summary/summarySlice";

export interface ProfilePageGetServerSideProps {
  summary: SummaryState["summary"] | null;
  posts: PostState[];
  likedPosts: PostState[];
  sharedPosts: PostState[];
  sessionUserId?: number;
  profileId?: number;
}

export const fetchUserSummary = async (
  request: ProfileSummaryFindReqDto
): Promise<ProfilePageGetServerSideProps["summary"]> => {
  const data = await profilePageAPI.getUserSummary({
    user_id: parseId(request.profileId),
    follower_show_limit: 5,
    following_show_limit: 5,
  });
  return convertSummaryResponseToState(data);
};

export const fetchUserPosts = async (
  userId: string | string[],
  sessionUserId?: number
): Promise<PostState[]> => {
  const data = await profilePageAPI.getUserPosts({
    user_id: parseInt(typeof userId == "string" ? userId : userId[0]),
    session_user_id: sessionUserId,
  });
  return postsConverter.convertPostListDtoToPostListState({
    postListDto: data,
    sessionUserId: sessionUserId,
  });
};

interface FetchUserPostsProps {
  userId: number;
  sessionUserId?: number;
}

export const fetchUserLikedPosts = async ({
  userId,
  sessionUserId,
}: FetchUserPostsProps): Promise<PostState[]> => {
  const data = await profilePageAPI.getUserLikedPosts({
    user_id: userId,
    session_user_id: sessionUserId,
  });
  return postsConverter.convertPostListDtoToPostListState({
    postListDto: data.post_like.map((dto) => dto.liked_posts),
    sessionUserId: sessionUserId,
  });
};

export const fetchUserSharedPosts = async ({
  userId,
  sessionUserId,
}: FetchUserPostsProps): Promise<PostState[]> => {
  const data = await profilePageAPI.getUserSharedPosts({
    user_id: userId,
    session_user_id: sessionUserId,
  });
  return postsConverter.convertPostListDtoToPostListState({
    postListDto: data.post_share.map((dto) => dto.shared_posts),
    sessionUserId: sessionUserId,
  });
};

export default {
  fetchUserSummary,
  fetchUserPosts,
  fetchUserLikedPosts,
  fetchUserSharedPosts,
};
