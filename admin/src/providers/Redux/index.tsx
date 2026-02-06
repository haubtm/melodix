"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

interface IReduxProviderProps {
  children: ReactNode;
}

const ReduxProvider = ({ children }: IReduxProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
