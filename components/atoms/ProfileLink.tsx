import appPages from "@/shared/appPages";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";

export interface ProfileLinkProps {
  sessionId?: number;
  profileId: number;
  child: ReactNode;
	setLoading?: ReturnType<typeof useState<boolean>>[1];
}

export default function ProfileLink({
  sessionId,
  profileId,
  child,
	setLoading
}: ProfileLinkProps) {
  const router = useRouter();

  const handleLinkClick = async () => {
    const path = sessionId
      ? appPages.user + sessionId + appPages.profile + profileId
      : appPages.profile + profileId;

		setLoading && setLoading(true);
    await router.push(path);
		setLoading && setLoading(false);
  };
  return <div onClick={handleLinkClick}>{child}</div>;
}
