import React from 'react';
import styles from './styles.module.css';

const activeTabs = {
	feed: 'feed',
	people: 'people',
	trending: 'trending',
};

export default function HomeNavigation() {
	const [activeTab, setActiveTab] = React.useState(activeTabs.feed);

  const getFeedActiveIndicatorStyle = () => {
    return activeTab == activeTabs.feed ? styles.activeSignOn : styles.activeSign;
  };

  const getPeopleActiveIndicatorStyle = () => {
    return activeTab == activeTabs.people ? styles.activeSignOn : styles.activeSign;
  };

  const getTrendingFeedActiveIndicatorStyle = () => {
    return activeTab == activeTabs.trending ? styles.activeSignOn : styles.activeSign;
  };

  return (
    <div className={styles.headerNavigation}>
      <div onClick={() => setActiveTab(activeTabs.feed)}>
        <p>FEED</p>
        <div className={getFeedActiveIndicatorStyle()}></div>
      </div>
      <div onClick={() => setActiveTab(activeTabs.people)}>
        <p>PEOPLE</p>
        <div className={getPeopleActiveIndicatorStyle()}></div>
      </div>
      <div onClick={() => setActiveTab(activeTabs.trending)}>
        <p>TRENDING</p>
        <div className={getTrendingFeedActiveIndicatorStyle()}></div>
      </div>
    </div>
  );
}
