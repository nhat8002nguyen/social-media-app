import appPages from "@/shared/appPages";
import Link from "next/link";
import { ReactElement } from "react";

export interface ProfileLinkProps {
  profileId: number;
  child: ReactElement;
}

export default function ProfileLink({ profileId, child }: ProfileLinkProps) {
  return <Link href={appPages.profile + "/" + profileId}>{child}</Link>;
}
