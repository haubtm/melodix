function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, '');
}

function getDefaultMediaBaseUrl(): string | null {
  const explicitBaseUrl = process.env.MEDIA_BASE_URL?.trim();
  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/+$/g, '');
  }

  const bucket = process.env.AWS_S3_BUCKET?.trim();
  const region = process.env.AWS_S3_REGION?.trim();

  if (!bucket || !region) {
    return null;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

function getAllowedMediaHosts(): Set<string> {
  const hosts = new Set<string>();
  const mediaBaseUrl = getDefaultMediaBaseUrl();

  if (mediaBaseUrl) {
    try {
      hosts.add(new URL(mediaBaseUrl).host);
    } catch {
      // ignore invalid MEDIA_BASE_URL values and fall back to direct checks
    }
  }

  const bucket = process.env.AWS_S3_BUCKET?.trim();
  const region = process.env.AWS_S3_REGION?.trim();
  if (bucket && region) {
    hosts.add(`${bucket}.s3.${region}.amazonaws.com`);
  }

  return hosts;
}

export function normalizeMediaKey(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  if (!/^https?:\/\//i.test(trimmedValue)) {
    return trimSlashes(trimmedValue);
  }

  try {
    const url = new URL(trimmedValue);
    const allowedHosts = getAllowedMediaHosts();

    if (!allowedHosts.has(url.host)) {
      return trimmedValue;
    }

    return trimSlashes(url.pathname);
  } catch {
    return trimmedValue;
  }
}

export function buildMediaUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  const baseUrl = getDefaultMediaBaseUrl();
  if (!baseUrl) {
    return trimmedValue;
  }

  return `${baseUrl}/${trimSlashes(trimmedValue)}`;
}
