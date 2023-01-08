import { useOutsideClick } from "@/hooks/useOutsideClick";
import {
  getPathOfPostPageWithId,
  getPathOfProfilePageWithId,
  getPathOfServicePageWithId,
} from "@/shared/appPages";
import { appColors } from "@/shared/theme";
import { SearchOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AuthState } from "redux/slices/auth/authSlice";
import {
  getHotelSearchList,
  getPostSearchList,
  getUserSearchList,
} from "redux/slices/search";
import {
  HotelSearchList,
  PostsSearchListState,
  UsersSearchListState,
} from "redux/slices/search/interfaces";
import { RootState, useAppDispatch } from "redux/store/store";
import { AppButtonLoading } from "../atoms/AppLoading";
import { AppSmallText, CardTitleText } from "../atoms/appTexts";
import { AppMaskLoading } from "../atoms/app_mask_loading";
import styles from "./styles.module.css";

export interface SearchTopicProps {
  id: number;
  name: "People" | "Posts" | "Services";
  searchStatus: HotelSearchList["searchStatus"];
  items: {
    id: number;
    startText: string;
    endText: string;
  }[];
}

export default function SearchInput() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const { visible, setVisible } = useOutsideClick(searchRef);
  const [input, setInput] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);

  const { session }: AuthState = useSelector((state: RootState) => state.auth);
  const { hotels, searchStatus: hotelSearchStatus }: HotelSearchList =
    useSelector((state: RootState) => state.hotelSearch);
  const { posts, searchStatus: postSearchStatus }: PostsSearchListState =
    useSelector((state: RootState) => state.postSearch);
  const { users, searchStatus: userSearchStatus }: UsersSearchListState =
    useSelector((state: RootState) => state.userSearch);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.currentTarget.value);
  };

  const handleKeydown = (e: KeyboardEvent<Element>) => {
    if (e.key == "Enter" && input?.length > 0) {
      startSearching();
    }
  };

  const startSearching = () => {
    setVisible(true);
    dispatch(getUserSearchList({ search: input, limit: 5 }));
    dispatch(getPostSearchList({ search: input, limit: 5 }));
    dispatch(getHotelSearchList({ search: input, limit: 5 }));
  };

  const searchTopicResults: SearchTopicProps[] = [
    {
      id: 0,
      name: "People",
      searchStatus: userSearchStatus,
      items:
        users?.length > 0
          ? users.map((u) => ({
              id: u.id,
              startText: u.username,
              endText: u.shortBio,
            }))
          : [],
    },
    {
      id: 1,
      name: "Posts",
      searchStatus: postSearchStatus,
      items:
        posts?.length > 0
          ? posts.map((u) => ({
              id: u.id,
              startText:
                u.title.length > 20
                  ? u.title.substring(0, 20) + "..."
                  : u.title,
              endText:
                u.body.length > 20 ? u.body.substring(0, 20) + "..." : u.body,
            }))
          : [],
    },
    {
      id: 2,
      name: "Services",
      searchStatus: hotelSearchStatus,
      items:
        hotels?.length > 0
          ? hotels.map((h) => ({
              id: h.id,
              startText: h.name,
              endText: h.location,
            }))
          : [],
    },
  ];

  const handleItemClick = async (
    topic: SearchTopicProps["name"],
    item: SearchTopicProps["items"][number]
  ) => {
    setLoading(true);
    switch (topic) {
      case "People":
        await navigateToProfilePage(item.id);
        break;
      case "Posts":
        await navigateToPostPage(item.id);
        break;
      case "Services":
        await navigateToServicePage(item.id);
        break;
      default:
        break;
    }
    setLoading(false);
  };

  const navigateToProfilePage = async (id: number) => {
    const sessionUserId = session?.user.DBID ?? 0;
    await router.push(getPathOfProfilePageWithId(sessionUserId, id));
  };

  const navigateToPostPage = async (id: number) => {
    const sessionUserId = session?.user.DBID ?? 0;
    await router.push(getPathOfPostPageWithId(sessionUserId, id));
  };

  const navigateToServicePage = async (id: number) => {
    const sessionUserId = session?.user.DBID ?? 0;
    await router.push(getPathOfServicePageWithId(sessionUserId, id));
  };

  return (
    <div ref={searchRef}>
      <div className={styles.searchInput}>
        <SearchOutlined
          onClick={startSearching}
          fontSize="medium"
          className={styles.searchIcon}
        />
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search"
          onChange={handleInputChange}
          onKeyDown={handleKeydown}
        />
      </div>
      {visible && (
        <div className={styles.searchResult} id="search-result">
          {searchTopicResults?.length > 0 ? (
            searchTopicResults.map((result) => (
              <div key={result.id} className={styles.topic}>
                <CardTitleText
                  text={result.name}
                  styles={{ margin: 0, fontSize: 16, color: appColors.primary }}
                />
                {result.searchStatus == "pending" ? (
                  <AppButtonLoading />
                ) : result.items?.length > 0 ? (
                  result.items.map((item) => (
                    <AppMaskLoading key={item.id} isLoading={loading}>
                      <div
                        key={item.id}
                        className={styles.item}
                        onClick={() => handleItemClick(result.name, item)}
                      >
                        <AppSmallText
                          styles={{ flex: 1 }}
                          text={item.startText}
                        />
                        <AppSmallText text="-" />
                        <AppSmallText
                          styles={{ flex: 1 }}
                          text={item.endText}
                        />
                      </div>
                    </AppMaskLoading>
                  ))
                ) : (
                  <AppSmallText
                    className={styles.item}
                    text={"No " + result.name + " found !"}
                  />
                )}
              </div>
            ))
          ) : (
            <AppButtonLoading />
          )}
        </div>
      )}
    </div>
  );
}
