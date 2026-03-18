import { Input } from "antd";
import type { InputProps, PasswordProps } from "antd/es/input";
import styles from "./Input.module.css";

const mergeClassName = (...classNames: Array<string | undefined>) =>
  classNames.filter(Boolean).join(" ");

export const AppInput = ({ className, ...props }: InputProps) => (
  <Input {...props} className={mergeClassName(styles.field, className)} />
);

export const AppPasswordInput = ({
  className,
  ...props
}: PasswordProps) => (
  <Input.Password
    {...props}
    className={mergeClassName(styles.field, className)}
  />
);
