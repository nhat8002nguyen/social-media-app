import { EvaluationPostDto, PostListResponseDto } from "apis/home/interfaces";
import { ImageState, PostState } from "./postListSlice";

export const updateHomePostsFromResponse = (
  response: PostListResponseDto,
  userId: number
): Array<PostState> => {
  const totalResponsePosts: Array<EvaluationPostDto> = [];
  response?.user[0].followers.forEach((person) =>
    totalResponsePosts.push(...person.following_user.evaluation_posts)
  );
  totalResponsePosts.push(...response?.user[0].evaluation_posts);

  const postsState = convertPostListDtoToPostListState(
    totalResponsePosts,
    userId
  );

  return postsState;
};

export const convertPostListDtoToPostListState = (
  postListDto: EvaluationPostDto[],
  currentUserId?: number
): PostState[] => {
  const posts = postListDto.map(
    (dto) =>
      <PostState>{
        id: dto.id,
        postOwner: {
          id: dto.post_owner.id,
          username: dto.post_owner.user_name,
          image: dto.post_owner.image,
          email: dto.post_owner.email,
          shortBio: dto.post_owner.short_bio,
          createdAt: dto.post_owner.created_at,
        },
        title: dto.title,
        body: dto.body,
        images: dto.post_images.map(
          (imageDto) =>
            ({
              id: imageDto.id,
              url: imageDto.url,
            } as ImageState)
        ),
        hotel:
          dto.post_hotel == null
            ? null
            : {
                id: dto.post_hotel.id,
                name: dto.post_hotel.name,
                location: dto.post_hotel.location,
                about: dto.post_hotel.about,
                rating: dto.post_hotel.rating,
              },
        locationRating: dto.location_rating,
        cleanlinessRating: dto.cleanliness_rating,
        serviceRating: dto.service_rating,
        valueRating: dto.value_rating,
        likedCount: dto.post_likes_aggregate.aggregate.count,
        sharedCount: dto.post_shares_aggregate.aggregate.count,
        commentCount: dto.post_comments_aggregate.aggregate.count,
        isLiked:
          currentUserId != undefined && currentUserId != null
            ? dto.post_likes.find((like) => like.user_id == currentUserId) ==
              undefined
              ? false
              : true
            : false,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
      }
  );

  posts.sort(
    (a, b) => new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf()
  );

  return posts;
};

export default {
  updateHomePostsFromResponse,
  convertPostListDtoToPostListState,
};
