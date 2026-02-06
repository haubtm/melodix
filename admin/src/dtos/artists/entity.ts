export interface Artist {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  country?: string;
  verified: boolean;
  monthlyListeners: number;
  userId?: number;
  createdAt: string;
  updatedAt: string;
}
