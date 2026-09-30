import { ReactNode } from "react";
import styles from "./taxt.module.css";

interface TextBackroundProps {
  children: ReactNode;
  Url: string;
}


export default function TextBackround({ Url, children }: TextBackroundProps) {
  return (
    <a className={styles.page} href={Url}>
      {children}
    </a>
  );
}
