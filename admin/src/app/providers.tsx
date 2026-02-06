"use client";

import React, { useEffect } from "react";
import { AntdProvider, ReactQueryProvider, ReduxProvider } from "@/providers";
import { store } from "@/store";
import { initializeAuth } from "@/store/slices/authSlice";
import { initializeTheme } from "@/store/slices/uiSlice";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
    store.dispatch(initializeTheme());
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ReactQueryProvider>
        <AntdProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </AntdProvider>
      </ReactQueryProvider>
    </ReduxProvider>
  );
}
