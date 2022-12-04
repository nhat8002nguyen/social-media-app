import { SearchOutlined } from "@mui/icons-material";
import styles from "./styles.module.css";

export default function SearchInput() {
  return (
    <form className={styles.searchContainer}>
      <SearchOutlined fontSize="medium" className={styles.searchIcon} />
      <input className={styles.searchInput} type="text" placeholder="Search" />
    </form>
  );
}
