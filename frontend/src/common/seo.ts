const FALLBACK_SITE_URL = "http://localhost:4000";
const FALLBACK_SITE_NAME = "Melodix";
const FALLBACK_DESCRIPTION =
  "Nghe nhạc, khám phá album và nghệ sĩ mới trên Melodix.";

export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || FALLBACK_SITE_NAME,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || FALLBACK_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL,
  locale: "vi_VN",
};
