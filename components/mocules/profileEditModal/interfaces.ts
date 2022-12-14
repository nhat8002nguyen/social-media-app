import { useModal } from "@nextui-org/react";
import { useState } from "react";
import { SummaryState } from "redux/slices/profile/summary/summarySlice";

type UseModelType = ReturnType<typeof useModal>;
type UseStateType = ReturnType<typeof useState<SummaryState["summary"]>>

export interface ProfileEditModalProps {
	setVisible: UseModelType['setVisible'];
	bindings: UseModelType['bindings'];
	prevProfileInfo?: UseStateType[0];
	loading?: boolean;
}

export interface EditableProfileState {
	username: string;
	shortBio: string;
	phone: string;
	about: string;
}