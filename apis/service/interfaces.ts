import { EvaluationPostDto } from "apis/home/interfaces";

export interface PostsByServiceIdReqDto {
  service_id: number;
  session_user_id: number;
  offset?: number;
  limit?: number;
}

export interface PostsByServiceIdResDto {
  evaluation_post: Array<EvaluationPostDto>;
}
