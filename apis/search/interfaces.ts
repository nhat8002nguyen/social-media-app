export interface SearchRequestDto {
  search: string;
  limit?: number;
}

export interface HotelsSearchResponseDto {
  search_hotels_with_limit: {
    id: number;
    name: string;
    location: string;
    created_at: string;
  }[];
}

export interface PostsSearchResponseDto {
  search_posts: {
    id: number;
    title: string;
    body: string;
    hotel: number;
    created_at: string;
    post_owner: {
      id: string;
      user_name: string;
      short_bio: string;
    };
  }[];
}

export interface UsersSearchResponseDto {
  search_users: {
    id: number;
    image: string;
    user_name: string;
    short_bio: string;
    email: string;
    created_at: string;
  }[];
}
