import { FormElement } from "@nextui-org/react";
import {
  ChangeEvent,
  FocusEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
} from "react";
import {
  CommentDetailState,
  CommentsState,
} from "redux/slices/home/comments/commentsSlice";
import { PostState } from "redux/slices/home/posts/postListSlice";

export interface MenuListCompositionProps {
  postProps: PostState;
}

export interface EvaluationPostProps {
  postState: PostState;
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
  insertStatus?: CommentsState["insertStatus"];
  onInputBlur?: FocusEventHandler<FormElement>;
  autoInputFocus?: boolean;
}

export interface CommentThreadProps {
  commentState: CommentDetailState;
  postProps: PostState;
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
