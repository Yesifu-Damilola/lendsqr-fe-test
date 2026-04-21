import styles from "./Skeleton.module.scss";

export type SkeletonProps = {
  className?: string;
  /** Renders a circular block (e.g. icon or avatar placeholder). */
  circle?: boolean;
};

export function Skeleton({ className, circle }: SkeletonProps) {
  const classes = [styles.root, circle ? styles.circle : "", className]
    .filter(Boolean)
    .join(" ");

  return <span className={classes} aria-hidden />;
}
