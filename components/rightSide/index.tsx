import useNotification, {
  NotificationTileProps,
} from "@/hooks/use_notification";
import { appColors } from "@/shared/theme";
import { showFullLocaleDateTime } from "@/shared/utils/home";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ScrollToTopButton } from "../atoms/ScrollToTopButton";
import { AppNormalText, AppSmallText } from "../atoms/appTexts";
import { AppMaskLoading } from "../atoms/app_mask_loading";
import SearchInput from "../searchInput";
import styles from "./styles.module.css";

export default function RightSide() {
  const { notifications } = useNotification({ feedProps: null });

  return (
    <div className={styles.right}>
      <div className={styles.fixedArea}>
        <SearchInput />
        <NotificationView notifications={notifications} />
        <ScrollToTopButton />
      </div>
    </div>
  );
}

export interface NotificationViewProps {
  notifications: Array<NotificationTileProps>;
}

const NotificationView = ({
  notifications,
}: NotificationViewProps): JSX.Element => {
  return (
    <div className={styles.notificationView}>
      <AppNormalText
        text="Notifications"
        styles={{
          padding: "0.5rem",
          paddingLeft: "1rem",
          color: "black",
          fontWeight: "bold",
          borderBottom: "1px solid rgb(201, 201, 201)",
        }}
      />
      {notifications?.length > 0
        ? notifications.map((n, i) => (
            <NotificationTile key={n.id} {...n} index={i} />
          ))
        : Array(4).map((_, i) => (
            <NotificationTile
              key={i}
              title1="Post: Some world about landmark 81 hotel"
              title2="Nhat Nguyen commented"
              description="That very awesome evaluation, and I will play it someday"
              dateTime="2023-01-02T08:25:36Z"
            />
          ))}
    </div>
  );
};

const NotificationTile = ({
  title1,
  title2,
  description,
  dateTime,
  path,
  index,
}: NotificationTileProps): JSX.Element => {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [blink, setBlink] = useState<boolean>(false);

  useEffect(() => {
    if (index === 0) {
      setBlink(true);
      setTimeout(() => {
        setBlink(false);
      }, 5000);
    }
    router.prefetch(path);
  }, []);

  const handleTileClick = async () => {
    setLoading(true);
    path && (await router.push(path));
    setLoading(false);
  };
  return (
    <AppMaskLoading isLoading={loading}>
      <div
        className={styles.notificationTile}
        style={
          blink ? { border: "2px solid green", borderRadius: "1rem" } : null
        }
        onClick={handleTileClick}
      >
        <AppSmallText
          styles={{
            fontStyle: "bold",
            color: appColors.primary,
          }}
          text={title1.length < 40 ? title1 : title1.substring(0, 40) + "..."}
        />
        <div>
          <AppSmallText
            styles={{ color: "black" }}
            text={
              title2
                ? title2.length < 40
                  ? title2
                  : title2.substring(0, 40) + "..."
                : "No title here"
            }
          />
          {description
            .split("\\n")
            .slice(0, 2)
            .map((d, i) => (
              <AppSmallText
                key={i.toString()}
                text={d.length < 80 ? d : d.substring(0, 80) + "..."}
              />
            ))}
        </div>
        <div>
          <AppSmallText
            text={showFullLocaleDateTime(dateTime)}
            styles={{ textAlign: "end", fontSize: 11 }}
          />
        </div>
      </div>
    </AppMaskLoading>
  );
};
