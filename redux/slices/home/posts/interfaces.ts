export interface PostListState {
  posts: Array<PostState>;
  loading: "idle" | "loading" | "succeeded" | "failed";
  deleteRequestStatus: "idle" | "pending" | "succeeded" | "failed";
  newsFeedPagingInfo: {
    nextFollowingOffset: number;
    nextOwnerOffset: number;
  };
  followingsSharedPostsNextOffset: number;
  previousIndex: number;
}

export interface PostState {
  id: number;
  postOwner: PostOwnerState;
  title: string | null;
  body: string;
  images: Array<ImageState>;
  hotel: HotelState | null;
  locationRating: number;
  cleanlinessRating: number;
  serviceRating: number;
  valueRating: number;
  likedCount: number;
  sharedCount: number;
  commentCount: number;
  isLiked: boolean;
  isShared: boolean;
  sharedUsers: {
    id: number;
    username: string;
  }[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostOwnerState {
  id: number;
  username: string;
  image: string;
  email?: string;
  shortBio: string | null;
  createdAt: string;
}

export interface ImageState {
  id: number;
  url: string;
}

export interface HotelState {
  id: number;
  name: string;
  location: string;
  about: string;
  rating: number;
}
