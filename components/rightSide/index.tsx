import React from 'react';
import SearchInput from '../searchInput';
import styles from './styles.module.css';

export default function RightSide() {
  return (
    <div className={styles.right}>
      <div className={styles.fixedArea}>
        <SearchInput />
      </div>
    </div>
  );
}
