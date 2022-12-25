export interface HotelSearchList {
  hotels: {
    id: number;
    name: string;
    location: string;
    created_at: string;
  }[];
  searchStatus: "idle" | "pending" | "succeeded" | "failed";
}

export interface PostsSearchListState {
  posts: {
    id: number;
    title: string;
    body: string;
    hotel: number;
    createdAt: string;
    postOwner: {
      id: string;
      username: string;
      shortBio: string;
    };
  }[];
  searchStatus: "idle" | "pending" | "succeeded" | "failed";
}

export interface UsersSearchListState {
  users: {
    id: number;
    image: string;
    username: string;
    shortBio: string;
    email: string;
    createdAt: string;
  }[];
  searchStatus: "idle" | "pending" | "succeeded" | "failed";
}
