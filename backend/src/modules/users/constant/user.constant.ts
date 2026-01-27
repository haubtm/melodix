export const USER_ERRORS = {
  EMAIL_EXISTS: 'Email đã được sử dụng',
  USERNAME_EXISTS: 'Username đã được sử dụng',
  USER_NOT_FOUND: 'User không tồn tại',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  ACCOUNT_DISABLED: 'Tài khoản đã bị vô hiệu hóa',
};

export const USER_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PASSWORD_SALT_ROUNDS: 10,
};

export const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  PREMIUM: 'premium',
  FAMILY: 'family',
} as const;

export type SubscriptionType = (typeof SUBSCRIPTION_TYPES)[keyof typeof SUBSCRIPTION_TYPES];
