import { useModal } from "@nextui-org/react";
import { useState } from "react";
import { PostFormDetailState } from "redux/slices/home/posts/postFormSlice";

type UseModelType = ReturnType<typeof useModal>;
type UseStateType = ReturnType<typeof useState<PostFormDetailState>>

export interface PostModalProps {
	setVisible: UseModelType['setVisible'];
	bindings: UseModelType['bindings'];
	initialPostInfo?: UseStateType[0];
	purpose: "add" | "edit";
}

export interface RatingAreaProps {
	postInfo: UseStateType[0];
	setPostValues: UseStateType[1];
}

export interface FileWithURL {
  file: File;
  url: string;
}

export interface PhotosAddingProps {
	postInfo: UseStateType[0];
	setPostValues: UseStateType[1];
}