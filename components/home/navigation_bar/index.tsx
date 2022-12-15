import appPages from "@/shared/appPages";
import { useRouter } from "next/router";
import React from "react";
import styles from "./styles.module.css";

export const homeActiveTabs: NavigationBarProps["tabs"] = [
  { id: 0, name: "HOME" },
  { id: 1, name: "PEOPLE" },
  { id: 2, name: "TRENDING" },
];

export const profilePostTabs: NavigationBarProps["tabs"] = [
  { id: 0, name: "POST" },
  { id: 1, name: "LIKED" },
];

export interface NavigationBarProps {
  tabs: { id: number; name: string }[];
  onTabChange?: (tab: NavigationBarProps["tabs"][number]) => void;
  type: "APP" | "PROFILE";
}

export default function NavigationBar({
  tabs,
  onTabChange,
  type,
}: NavigationBarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<
    NavigationBarProps["tabs"][number]
  >(tabs[0]);

  const getActiveIndicatorStyle = (name: string) => {
    if (type == "PROFILE") {
      return activeTab.name == name ? styles.activeSignOn : styles.activeSign;
    } else if (type == "APP") {
      const routes = {
        [homeActiveTabs[0].name]: appPages.home,
        [homeActiveTabs[1].name]: appPages.people,
        [homeActiveTabs[2].name]: appPages.trending,
      };
      return router.pathname.includes(routes[name])
        ? styles.activeSignOn
        : styles.activeSign;
    }
  };

  const onChange = (tab: NavigationBarProps["tabs"][number]) => {
    if (type == "APP") {
      handleAppTabChange(tab.name);
    }
    if (type == "PROFILE") {
      if (tab.id != activeTab.id) {
        onTabChange(tab);
        setActiveTab(tab);
      }
    }
  };

  const handleAppTabChange = (name: string) => {
    switch (name) {
      case "HOME":
        router.push(appPages.home);
        break;
      case "PEOPLE":
        router.push(appPages.people);
        break;
      case "TRENDING":
        router.push(appPages.trending);
        break;
      default:
        router.push(appPages.home);
        break;
    }
  };

  return (
    <div className={styles.headerNavigation}>
      {tabs.map((tab) => (
        <div key={tab.id} onClick={() => onChange(tab)}>
          <p>{tab.name}</p>
          <div className={getActiveIndicatorStyle(tab.name)}></div>
        </div>
      ))}
    </div>
  );
}
