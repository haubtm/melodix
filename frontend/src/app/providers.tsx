"use client";

import { ReactNode } from "react";
import { AntdProvider, ReactQueryProvider, ReduxProvider } from "@/providers";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <ReactQueryProvider>
        <AntdProvider>{children}</AntdProvider>
      </ReactQueryProvider>
    </ReduxProvider>
  );
}
