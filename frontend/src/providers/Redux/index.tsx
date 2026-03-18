"use client";

import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { authApi } from "@/api";
import { store } from "@/store";
import {
  finishAuthInitialization,
  initializeAuth,
  logout,
  setCredentials,
} from "@/store/slices/authSlice";

const AuthInitializer = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    let isMounted = true;

    const hydrateAuth = async () => {
      store.dispatch(initializeAuth());

      const state = store.getState().auth;
      if (!state.accessToken || !state.refreshToken) {
        store.dispatch(finishAuthInitialization());
        return;
      }

      try {
        const profile = await authApi.getProfile();

        if (!isMounted) return;

        const { accessToken, refreshToken, ...user } = profile;
        store.dispatch(
          setCredentials({
            user,
            accessToken,
            refreshToken,
          }),
        );
      } catch {
        if (!isMounted) return;
        store.dispatch(logout());
      } finally {
        if (isMounted) {
          store.dispatch(finishAuthInitialization());
        }
      }
    };

    hydrateAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  return <>{children}</>;
};

const ReduxProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
};

export default ReduxProvider;
