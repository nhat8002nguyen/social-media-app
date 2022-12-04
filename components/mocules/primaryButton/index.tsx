import styles from "./styles.module.css";

export default function PrimaryButton({ name, onClick }) {
  return (
    <div className={styles.primaryButton} onClick={onClick}>
      <p>{name}</p>
    </div>
  );
}
