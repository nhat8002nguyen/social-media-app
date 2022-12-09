import {
  AccountCircleRounded,
  ExitToAppRounded,
  HomeRounded,
  Twitter,
  WhatshotRounded,
} from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import { UserRequestDto } from "apis/auth/authAPI";
import { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
    path: appPages.home,
  } as MenuItemProps["item"],
  {
    id: 1,
    icon: <AccountCircleRounded />,
    name: "PROFILE",
    focus: currentPage == appPages.profile,
    path: appPages.profile,
  } as MenuItemProps["item"],
  // {
  //   id: 3,
  //   icon: <TranslateRounded />,
  //   name: "LANGUAGE",
  //   focus: currentPage == appPages.language,
  // },
  // {
  //   id: 4,
  //   icon: <WebRounded />,
  //   name: "HOTELS",
  //   focus: currentPage == appPages.pages,
  // },
  {
    id: 5,
    icon: <WhatshotRounded />,
    name: "TRENDING",
    focus: currentPage == appPages.trending,
    path: appPages.trending,
  } as MenuItemProps["item"],
  {
    id: 6,
    icon: <ExitToAppRounded />,
    name: "LOGOUT",
    focus: currentPage == appPages.logout,
    path: appPages.logout,
  } as MenuItemProps["item"],
];

interface MenuItemProps {
  item: {
    id: number;
    icon: JSX.Element;
    name: "FEED" | "PROFILE" | "TRENDING" | "LOGOUT";
    focus: boolean;
    path: string;
  };
  onMenuItemClick: (name: string) => void;
  confirmModalVisible: boolean;
  onLogoutModalCloseClick: () => void;
}

export interface LeftSideProps {
  currentPage: string;
}

export default function LeftSide(props: LeftSideProps) {
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
  const [loginRequireInterval, setLoginRequireInterval] =
    useState<NodeJS.Timer>();
  const [loginRequireVisible, setLoginRequireVisible] =
    useState<boolean>(false);

  useEffect(() => {
    if (sessionStatus == "unauthenticated") {
      const loginRequireInterval = setInterval(() => {
        setLoginRequireVisible(true);
      }, 5000);
      setLoginRequireInterval(loginRequireInterval);
    } else if (sessionStatus == "authenticated") {
      clearInterval(loginRequireInterval);
      saveSessionToState(session);
      syncGoogleAccountToDB();
      setSignInButtonText(session.user.name);
    }
  }, [
    sessionStatus,
    syncGoogleAccountDB,
    setSignInButtonText,
    setLoginRequireVisible,
  ]);

  const saveSessionToState = (session: Session) => {
    let authState: AuthState = {
      session: {
        user: {
          DBID: null,
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

  const handleMenuItemClick = (name: string) => {
    if (name == "FEED") {
      handleHomeItemClick();
    } else if (name == "LOGOUT") {
      handleLogoutItemClick();
    }
  };

  const handleHomeItemClick = () => {
    const userId = authSession?.user.DBID;
    if (userId != null) {
      dispatch(showOtherUsers({ showType: "random" }));
      dispatch(findNewsFeedPosts({ userId: userId }));
    }
  };

  const handleLogoutItemClick = () => {
    setConfirmModalVisible(true);
  };

  const handleLoginRequireClose = () => {
    setLoginRequireVisible(false);
    clearInterval(loginRequireInterval);
  };

  return (
    <div className={styles.menu}>
      <div className={styles.fixedArea}>
        <div className={styles.iconContainer}>
          <Twitter style={{ color: "rgb(101, 165, 255)" }} fontSize="large" />
        </div>
        <div className={styles.menuItemList}>
          {menuItems.map((item) => (
            <MenuItem
              item={item}
              onMenuItemClick={handleMenuItemClick}
              confirmModalVisible={confirmModalVisible}
              onLogoutModalCloseClick={() => setConfirmModalVisible(false)}
            />
          ))}
          <ConfirmModal
            trigger={undefined}
            title={"Please login to use the application !"}
            description={
              "You need login by your google account, or register a new account to use full features of this application."
            }
            visible={loginRequireVisible}
            onConfirmClick={() => signIn("google")}
            onCloseClick={handleLoginRequireClose}
            loading={false}
          />
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

const MenuItem = (props: MenuItemProps) => {
  const { session }: AuthState = useSelector((state: RootState) => state.auth);
  const {
    item,
    confirmModalVisible,
    onMenuItemClick,
    onLogoutModalCloseClick,
  } = props;

  const Item = () => {
    return (
      <div
        key={item.id}
        className={!item.focus ? styles.menuItem : styles.menuItemFocus}
        onClick={() => onMenuItemClick(item.name)}
      >
        {item.icon}
        <p>{item.name}</p>
      </div>
    );
  };
  if (item.name == "LOGOUT") {
    return (
      <ConfirmModal
        trigger={<Item />}
        title={"Confirmation"}
        description={"Are you sure that you want to logout ?"}
        visible={confirmModalVisible}
        onConfirmClick={() => signOut()}
        onCloseClick={onLogoutModalCloseClick}
        loading={false}
      />
    );
  }
  if (item.name == "PROFILE") {
    const userId = session?.user.DBID;
    const path = userId != null ? item.path + "/" + userId : "/home";
    return (
      <Link href={path}>
        <a>
          <Item />
        </a>
      </Link>
    );
  }
  return (
    <Link href={item.path}>
      <a>
        <Item />
      </a>
    </Link>
  );
};
