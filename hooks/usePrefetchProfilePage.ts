import appPages from "@/shared/appPages";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import { RootState } from "redux/store/store";

export interface PrefetchProfilePageHookProps {
  ids: number[] | null;
}

export default function usePrefetchProfilePage({
  ids,
}: PrefetchProfilePageHookProps) {
  const router = useRouter();
  const { session, sessionStatus }: AuthState = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!ids) {
      return;
    }

    for (let id in ids) {
      const path =
        appPages.user +
        (sessionStatus == "authenticated" ? session?.user.DBID : 0) +
        appPages.profile +
        id;
      router.prefetch(path);
    }
  }, [ids]);
}
