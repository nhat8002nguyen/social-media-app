export interface HotelSearchList {
  hotels: {
    id: number;
    name: string;
    location: string;
    created_at: string;
  }[];
  searchStatus: "idle" | "pending" | "succeeded" | "failed";
}
