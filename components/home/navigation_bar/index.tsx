import React from "react";
import styles from "./styles.module.css";

export const homeActiveTabs: NavigationBarProps["tabs"] = [
  { id: 0, name: "FEED" },
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
}

export default function NavigationBar({
  tabs,
  onTabChange,
}: NavigationBarProps) {
  const [activeTab, setActiveTab] = React.useState<
    NavigationBarProps["tabs"][number]
  >(tabs[0]);

  const getActiveIndicatorStyle = (id: number) => {
    return activeTab.id == id ? styles.activeSignOn : styles.activeSign;
  };

  const onChange = (tab: NavigationBarProps["tabs"][number]) => {
    if (tab.id != activeTab.id) {
      onTabChange(tab);
      setActiveTab(tab);
    }
  };

  return (
    <div className={styles.headerNavigation}>
      {tabs.map((tab) => (
        <div key={tab.id} onClick={() => onChange(tab)}>
          <p>{tab.name}</p>
          <div className={getActiveIndicatorStyle(tab.id)}></div>
        </div>
      ))}
    </div>
  );
}
