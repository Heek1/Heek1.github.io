import { ReactNode } from "react";
import styles from "./TextLink.module.css";

interface TextLinkProps {
  children: ReactNode;
  href: string;
}

export default function TextLink({ href, children }: TextLinkProps) {
  return (
    <a className={styles.link} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
