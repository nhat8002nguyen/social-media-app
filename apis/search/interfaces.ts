export interface SearchRequestDto {
  search: string;
  limitation?: number;
}

export interface HotelsSearchResponseDto {
  search_hotels_with_limit: {
    id: number;
    name: string;
    location: string;
    created_at: string;
  }[];
}
