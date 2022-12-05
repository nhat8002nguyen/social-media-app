import useNewsFeed from "@/hooks/useNewsFeed";
import { FormElement } from "@nextui-org/react";
import {
  ChangeEvent,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import { CommentDetailState } from "redux/slices/home/comments/commentsSlice";
import { PostState } from "redux/slices/home/posts/postListSlice";

export interface MenuListCompositionProps {
  postProps: PostState;
}

export interface EvaluationPostProps {
  postState: PostState;
  refreshNewsFeed: ReturnType<typeof useNewsFeed>["refreshNewsFeed"];
}

export interface CommentAreaProps {
  postProps: PostState;
  avatar: string | null;
}

export interface CommentInputProps {
  avatar: string;
  value: string;
  onChange: (e: ChangeEvent<FormElement>) => void;
  onSendClick: MouseEventHandler<SVGSVGElement>;
  onInputFocus?: FocusEventHandler<FormElement>;
  onInputKeydown?: KeyboardEventHandler<FormElement>;
  insertStatus?: string;
  onInputBlur?: FocusEventHandler<FormElement>;
  autoInputFocus?: boolean;
}

export interface CommentThreadProps {
  commentState: CommentDetailState;
}

export interface PostRatingArea {
  locationRating: number;
  serviceRating: number;
  cleanlinessRating: number;
  valueRating: number;
}

export interface CommentProps {
  reply: CommentDetailState;
}
