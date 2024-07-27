import styles from "./spinner.module.css";

type SpinnerProps = {
  size?: number;
};

export function Spinner(props: SpinnerProps) {
  const { size = 1 } = props;
  const dimensions = size * 10;
  return (
    <span
      className={styles.spinner}
      style={{
        width: `${dimensions}px`,
        height: `${dimensions}px`,
        borderWidth: `${size}px`,
      }}
    ></span>
  );
}
