"use client";

import { ReactNode, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { StyleProvider, createCache, extractStyle } from "@ant-design/cssinjs";

const AntdStyleRegistry = ({ children }: { children: ReactNode }) => {
  const [cache] = useState(() => createCache());

  useServerInsertedHTML(() => {
    return (
      <style
        id="antd-ssr"
        dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
};

export default AntdStyleRegistry;
