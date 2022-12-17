import appPages from "@/shared/appPages";
import Link from "next/link";

export interface ProfileLinkProps {
  sessionId?: number;
  profileId: number;
  child: JSX.Element;
}

export default function ProfileLink({
  sessionId,
  profileId,
  child,
}: ProfileLinkProps) {
  const href = sessionId
    ? appPages.user + sessionId + appPages.profile + profileId
    : appPages.profile + profileId;
  return <Link href={href}>{child}</Link>;
}
