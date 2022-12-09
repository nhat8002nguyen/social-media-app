import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  fetchAllExistedUsers,
  FollowableUsersState,
} from "redux/slices/home/followableUsers/recommendUserListSlice";
import { RootState, useAppDispatch } from "redux/store/store";

export default function useAppearedUsers() {
  const { appearedUsers }: FollowableUsersState = useSelector(
    (state: RootState) => state.recommendUserList
  );
  const dispatch = useAppDispatch();
  const { data: session, status: sessionState } = useSession();
  const {
    session: authSession,
    sessionStatus: authSessionStatus,
    syncDBStatus,
  }: AuthState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (sessionState == "authenticated" && session.user != null) {
      const userId = authSession?.user?.DBID;
      if (userId == null) {
        return;
      }
      dispatch(fetchAllExistedUsers({ sessionUserId: userId, limit: 100 }));
    }
  }, [sessionState, authSession]);

  return { appearedUsers };
}
