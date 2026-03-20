"use client";

import { useEffect, useState } from "react";
import Image, { ImageProps } from "next/image";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc: string;
}

export default function FallbackImage({
  src,
  fallbackSrc,
  alt,
  unoptimized = true,
  ...props
}: FallbackImageProps) {
  const initialSrc = src || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  useEffect(() => {
    setCurrentSrc(initialSrc);
  }, [initialSrc]);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSrc}
      unoptimized={unoptimized}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
