import Image from "next/image";
import styles from "./page.module.css";
import Index from "./pages";

export default function Home() {
  return (
    <div className={styles.page}>
      <Index />
    </div>
  );
}
