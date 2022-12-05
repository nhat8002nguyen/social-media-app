import {
  AccountCircleRounded,
  ExitToAppRounded,
  ExploreRounded,
  HomeRounded,
  TranslateRounded,
  Twitter,
  WebRounded,
  WhatshotRounded,
} from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { UserRequestDto } from "redux/slices/auth/authAPI";
import {
  AuthState,
  setAuthState,
  syncGoogleAccountDB,
} from "redux/slices/auth/authSlice";
import { showOtherUsers } from "redux/slices/home/followableUsers/recommendUserListSlice";
import { findNewsFeedPosts } from "redux/slices/home/posts/postListSlice";
import { RootState, useAppDispatch } from "redux/store/store";
import appPages from "../../shared/appPages";
import GlobalButton from "../atoms/GlobalButton";
import ConfirmModal from "../mocules/confirmModal";
import styles from "./styles.module.css";

const createMenuItems = (currentPage) => [
  {
    id: 0,
    icon: <HomeRounded />,
    name: "FEED",
    focus: currentPage == appPages.home,
  },
  {
    id: 1,
    icon: <AccountCircleRounded />,
    name: "PROFILE",
    focus: currentPage == appPages.profile,
  },
  {
    id: 2,
    icon: <ExploreRounded />,
    name: "EXPLORE",
    focus: currentPage == appPages.explore,
  },
  {
    id: 3,
    icon: <TranslateRounded />,
    name: "LANGUAGE",
    focus: currentPage == appPages.language,
  },
  {
    id: 4,
    icon: <ExitToAppRounded />,
    name: "LOGOUT",
    focus: currentPage == appPages.logout,
  },
  {
    id: 5,
    icon: <WebRounded />,
    name: "PAGES",
    focus: currentPage == appPages.pages,
  },
  {
    id: 6,
    icon: <WhatshotRounded />,
    name: "TRENDING",
    focus: currentPage == appPages.trending,
  },
];

export default function LeftSide(props) {
  const { currentPage } = props;
  const dispatch = useAppDispatch();
  const { data: session, status: sessionStatus } = useSession();
  const { session: authSession }: AuthState = useSelector(
    (state: RootState) => state.auth
  );
  const [menuItems, setMenuItems] = useState(() =>
    createMenuItems(currentPage)
  );
  const [signInButtonText, setSignInButtonText] = useState(
    "Sign In With Google"
  );
  const [confirmModalVisible, setConfirmModalVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (sessionStatus == "authenticated") {
      saveSessionToState(session);
      syncGoogleAccountToDB();
      setSignInButtonText(session.user.name);
    }
  }, [sessionStatus, syncGoogleAccountDB, setSignInButtonText]);

  const saveSessionToState = (session: Session) => {
    let authState: AuthState = {
      session: {
        user: {
          db_id: null,
          google_account_id: (session as any).user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
        accessToken: (session as any).accessToken,
        error: (session as any).error,
      },
      sessionStatus: sessionStatus,
    };
    dispatch(setAuthState(authState));
  };

  const syncGoogleAccountToDB = () => {
    const user: UserRequestDto = {
      username: session.user.name,
      email: session.user.email,
      password: (session as any).user.id,
      image: session.user.image,
      googleAccountID: (session as any).user.id,
    };
    dispatch(syncGoogleAccountDB(user));
  };

  const onGoogleSignInButtonPress = () => {
    if (sessionStatus == "loading") {
      return;
    }
    if (sessionStatus == "authenticated") {
      //TODO: navigate to profile page
      signOut();
      return;
    }
    signIn("google");
  };

  const handleMenuItemClick = (id: number, name: string) => {
    if (id == 0 && name == "FEED") {
      handleHomeItemClick();
    } else if (id == 4 && name == "LOGOUT") {
      handleLogoutItemClick();
    }
  };

  const handleHomeItemClick = () => {
    const userId = authSession?.user.db_id;
    if (userId != null) {
      dispatch(showOtherUsers({ showType: "random" }));
      dispatch(findNewsFeedPosts({ userId: userId }));
    }
  };

  const handleLogoutItemClick = () => {
    setConfirmModalVisible(true);
  };

  return (
    <div className={styles.menu}>
      <div className={styles.fixedArea}>
        <div className={styles.iconContainer}>
          <Twitter style={{ color: "rgb(101, 165, 255)" }} fontSize="large" />
        </div>
        <div className={styles.menuItemList}>
          {menuItems.map((item) => {
            if (item.name == "LOGOUT") {
              return (
                <ConfirmModal
                  trigger={
                    <div
                      key={item.id}
                      className={
                        !item.focus ? styles.menuItem : styles.menuItemFocus
                      }
                      onClick={() => handleMenuItemClick(item.id, item.name)}
                    >
                      {item.icon}
                      <p>{item.name}</p>
                    </div>
                  }
                  title={"Confirmation"}
                  description={"Are you sure that you want to logout ?"}
                  visible={confirmModalVisible}
                  onConfirmClick={() => signOut()}
                  onCloseClick={() => setConfirmModalVisible(false)}
                  loading={false}
                />
              );
            }
            return (
              <div
                key={item.id}
                className={!item.focus ? styles.menuItem : styles.menuItemFocus}
                onClick={() => handleMenuItemClick(item.id, item.name)}
              >
                {item.icon}
                <p>{item.name}</p>
              </div>
            );
          })}
        </div>
        <GlobalButton
          icon={<GoogleIcon fontSize="small" />}
          text={signInButtonText}
          onPress={() => onGoogleSignInButtonPress()}
          loading={sessionStatus == "loading"}
        />
      </div>
    </div>
  );
}
