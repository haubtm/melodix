# Melodix Backend Design - NestJS

> **Tài liệu thiết kế Backend cho ứng dụng nghe nhạc Melodix**
>
> Ngày tạo: 2026-01-28

---

## Tổng quan

Backend cho Melodix được xây dựng trên **NestJS** - một framework Node.js mạnh mẽ với TypeScript, áp dụng kiến trúc modular và các design patterns như Dependency Injection, Repository Pattern.

### Tech Stack

| Component          | Technology              |
| ------------------ | ----------------------- |
| **Framework**      | NestJS v10+             |
| **Language**       | TypeScript              |
| **Database**       | PostgreSQL              |
| **ORM**            | TypeORM / Prisma        |
| **Cache**          | Redis                   |
| **Queue**          | Bull (Redis-based)      |
| **Authentication** | Passport.js + JWT       |
| **OAuth**          | Google, Facebook, Apple |
| **Real-time**      | Socket.IO / WebSocket   |
| **File Storage**   | AWS S3 / Cloudinary     |
| **API Docs**       | Swagger (OpenAPI)       |
| **Validation**     | class-validator         |
| **Testing**        | Jest                    |

---

## Project Structure

```
melodix-backend/
├── src/
│   ├── main.ts                     # Entry point
│   ├── app.module.ts               # Root module
│   │
│   ├── common/                     # Shared utilities
│   │   ├── decorators/             # Custom decorators
│   │   ├── filters/                # Exception filters
│   │   ├── guards/                 # Auth guards
│   │   ├── interceptors/           # Response interceptors
│   │   ├── pipes/                  # Validation pipes
│   │   ├── interfaces/             # Common interfaces
│   │   └── utils/                  # Helper functions
│   │
│   ├── config/                     # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   ├── s3.config.ts
│   │   └── oauth.config.ts
│   │
│   ├── database/                   # Database setup
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── database.module.ts
│   │
│   └── modules/                    # Feature modules
│       ├── auth/                   # Authentication
│       ├── users/                  # User management
│       ├── artists/                # Artist management
│       ├── albums/                 # Album management
│       ├── songs/                  # Song management
│       ├── genres/                 # Genre management
│       ├── playlists/              # Playlist management
│       ├── library/                # User library
│       ├── playback/               # Playback & Queue
│       ├── sync/                   # Device sync
│       ├── subscriptions/          # Subscription plans
│       ├── ads/                    # Advertisements
│       ├── search/                 # Search functionality
│       ├── upload/                 # File upload
│       └── notifications/          # Push notifications
│
├── test/                           # E2E tests
├── prisma/                         # Prisma schema (if using Prisma)
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Modules Design

### 1. Auth Module

Xử lý xác thực, đăng nhập OAuth, và quản lý session.

```
modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   ├── google.strategy.ts
│   ├── facebook.strategy.ts
│   └── apple.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   ├── oauth.guard.ts
│   └── premium.guard.ts          # Check premium subscription
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   ├── refresh-token.dto.ts
│   └── oauth-callback.dto.ts
└── interfaces/
    └── jwt-payload.interface.ts
```

#### API Endpoints

| Method | Endpoint                  | Description                 | Auth |
| ------ | ------------------------- | --------------------------- | ---- |
| POST   | `/auth/register`          | Đăng ký tài khoản mới       | No   |
| POST   | `/auth/login`             | Đăng nhập email/password    | No   |
| POST   | `/auth/refresh`           | Refresh access token        | No   |
| POST   | `/auth/logout`            | Đăng xuất                   | Yes  |
| GET    | `/auth/google`            | Khởi tạo Google OAuth       | No   |
| GET    | `/auth/google/callback`   | Google OAuth callback       | No   |
| GET    | `/auth/facebook`          | Khởi tạo Facebook OAuth     | No   |
| GET    | `/auth/facebook/callback` | Facebook OAuth callback     | No   |
| GET    | `/auth/sessions`          | Lấy danh sách sessions      | Yes  |
| DELETE | `/auth/sessions/:id`      | Xóa session (logout device) | Yes  |
| POST   | `/auth/change-password`   | Đổi mật khẩu                | Yes  |
| GET    | `/auth/me`                | Lấy profile cá nhân         | Yes  |

---

### 2. Users Module

Quản lý thông tin người dùng.

```
modules/users/
├── users.module.ts
├── users.controller.ts
├── users.service.ts
├── users.repository.ts
├── entities/
│   ├── user.entity.ts
│   ├── user-oauth.entity.ts
│   ├── user-session.entity.ts
│   └── user-device.entity.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-response.dto.ts
└── interfaces/
    └── user.interface.ts
```

#### API Endpoints

| Method | Endpoint                | Description                  | Auth |
| ------ | ----------------------- | ---------------------------- | ---- |
| GET    | `/users/me`             | Lấy thông tin user hiện tại  | Yes  |
| PATCH  | `/users/me`             | Cập nhật thông tin user      | Yes  |
| DELETE | `/users/me`             | Xóa tài khoản                | Yes  |
| GET    | `/users/me/devices`     | Lấy danh sách thiết bị       | Yes  |
| DELETE | `/users/me/devices/:id` | Xóa thiết bị                 | Yes  |
| GET    | `/users/:id`            | Lấy profile public của user  | No   |
| GET    | `/users/:id/playlists`  | Lấy playlist public của user | No   |

---

### 3. Artists Module

Quản lý nghệ sĩ.

```
modules/artists/
├── artists.module.ts
├── artists.controller.ts
├── artists.service.ts
├── entities/
│   └── artist.entity.ts
├── dto/
│   ├── create-artist.dto.ts
│   ├── update-artist.dto.ts
│   └── artist-response.dto.ts
└── interfaces/
    └── artist.interface.ts
```

#### API Endpoints

| Method | Endpoint                  | Description               | Auth         |
| ------ | ------------------------- | ------------------------- | ------------ |
| GET    | `/artists`                | Lấy danh sách artists     | No           |
| GET    | `/artists/:id`            | Lấy chi tiết artist       | No           |
| GET    | `/artists/:id/albums`     | Lấy albums của artist     | No           |
| GET    | `/artists/:id/top-tracks` | Lấy top tracks của artist | No           |
| GET    | `/artists/:id/related`    | Lấy artists liên quan     | No           |
| POST   | `/artists`                | Tạo artist (Admin)        | Admin        |
| PATCH  | `/artists/:id`            | Cập nhật artist           | Admin/Artist |
| DELETE | `/artists/:id`            | Xóa artist                | Admin/Artist |

---

### 4. Albums Module

Quản lý albums.

```
modules/albums/
├── albums.module.ts
├── albums.controller.ts
├── albums.service.ts
├── entities/
│   └── album.entity.ts
├── dto/
│   ├── create-album.dto.ts
│   ├── update-album.dto.ts
│   └── album-response.dto.ts
└── interfaces/
    └── album.interface.ts
```

#### API Endpoints

| Method | Endpoint               | Description            | Auth         |
| ------ | ---------------------- | ---------------------- | ------------ |
| Method | Endpoint               | Description            | Auth         |
| ------ | ---------------------- | ---------------------- | ------------ |
| GET    | `/albums`              | Lấy danh sách albums   | No           |
| GET    | `/albums/new-releases` | Lấy new releases       | No           |
| GET    | `/albums/:id`          | Lấy chi tiết album     | No           |
| GET    | `/albums/:id/tracks`   | Lấy tracks trong album | No           |
| POST   | `/albums`              | Tạo album              | Admin/Artist |
| PATCH  | `/albums/:id`          | Cập nhật album         | Admin/Artist |
| DELETE | `/albums/:id`          | Xóa album              | Admin/Artist |
| DELETE | `/albums/many`         | Xóa nhiều album        | Admin/Artist |

---

### 5. Songs Module

Quản lý bài hát.

```
modules/songs/
├── songs.module.ts
├── songs.controller.ts
├── songs.service.ts
├── entities/
│   ├── song.entity.ts
│   └── song-artist.entity.ts
├── dto/
│   ├── create-song.dto.ts
│   ├── update-song.dto.ts
│   └── song-response.dto.ts
└── interfaces/
    └── song.interface.ts
```

#### API Endpoints

| Method | Endpoint | Description | Auth |
| Method | Endpoint | Description | Auth |
| ------ | ------------------------ | ------------------------- | ------------ |
| GET | `/songs` | Lấy danh sách songs | No |
| GET | `/songs/my` | Lấy songs của tôi | Artist |
| GET | `/songs/pending` | Lấy songs đang chờ duyệt | Admin |
| GET | `/songs/:id` | Lấy chi tiết song | No |
| GET | `/songs/:id/stream` | Stream audio file | Yes |
| GET | `/songs/:id/lyrics` | Lấy lyrics | No |
| POST | `/songs` | Tạo song | Artist, Admin|
| PATCH | `/songs/:id` | Cập nhật song | Artist, Admin|
| PATCH | `/songs/:id/approve` | Duyệt song | Admin |
| PATCH | `/songs/:id/reject` | Từ chối song | Admin |
| DELETE | `/songs/:id` | Xóa song | Admin |
| POST | `/songs/:id/play` | Track play count | Yes |

---

### 6. Genres Module

Quản lý thể loại nhạc.

```
modules/genres/
├── genres.module.ts
├── genres.controller.ts
├── genres.service.ts
├── entities/
│   └── genre.entity.ts
└── dto/
    └── genre-response.dto.ts
```

#### API Endpoints

| Method | Endpoint                | Description              | Auth |
| ------ | ----------------------- | ------------------------ | ---- |
| GET    | `/genres`               | Lấy danh sách genres     | No   |
| GET    | `/genres/:id`           | Lấy chi tiết genre       | No   |
| GET    | `/genres/:id/playlists` | Lấy playlists theo genre | No   |
| GET    | `/genres/:id/artists`   | Lấy artists theo genre   | No   |

---

### 7. Playlists Module

Quản lý playlists.

```
modules/playlists/
├── playlists.module.ts
├── playlists.controller.ts
├── playlists.service.ts
├── entities/
│   ├── playlist.entity.ts
│   └── playlist-song.entity.ts
├── dto/
│   ├── create-playlist.dto.ts
│   ├── update-playlist.dto.ts
│   ├── add-songs.dto.ts
│   └── playlist-response.dto.ts
└── interfaces/
    └── playlist.interface.ts
```

#### API Endpoints

| Method | Endpoint                       | Description             | Auth    |
| ------ | ------------------------------ | ----------------------- | ------- |
| GET    | `/playlists`                   | Lấy playlists public    | No      |
| GET    | `/playlists/featured`          | Lấy featured playlists  | No      |
| GET    | `/playlists/:id`               | Lấy chi tiết playlist   | Partial |
| POST   | `/playlists`                   | Tạo playlist            | Yes     |
| PATCH  | `/playlists/:id`               | Cập nhật playlist       | Owner   |
| DELETE | `/playlists/:id`               | Xóa playlist            | Owner   |
| POST   | `/playlists/:id/songs`         | Thêm songs vào playlist | Owner   |
| DELETE | `/playlists/:id/songs/:songId` | Xóa song khỏi playlist  | Owner   |
| PUT    | `/playlists/:id/songs/reorder` | Sắp xếp lại songs       | Owner   |

---

### 8. Library Module

Quản lý thư viện cá nhân (yêu thích, theo dõi).

```
modules/library/
├── library.module.ts
├── library.controller.ts
├── library.service.ts
├── entities/
│   ├── user-library.entity.ts
│   ├── user-follow.entity.ts
│   ├── listening-history.entity.ts
│   └── recently-played.entity.ts
└── dto/
    └── library-response.dto.ts
```

#### API Endpoints

| Method | Endpoint                  | Description           | Auth |
| ------ | ------------------------- | --------------------- | ---- |
| GET    | `/me/library/songs`       | Lấy liked songs       | Yes  |
| PUT    | `/me/library/songs/:id`   | Like song             | Yes  |
| DELETE | `/me/library/songs/:id`   | Unlike song           | Yes  |
| GET    | `/me/library/albums`      | Lấy saved albums      | Yes  |
| PUT    | `/me/library/albums/:id`  | Save album            | Yes  |
| DELETE | `/me/library/albums/:id`  | Remove album          | Yes  |
| GET    | `/me/library/artists`     | Lấy followed artists  | Yes  |
| PUT    | `/me/library/artists/:id` | Follow artist         | Yes  |
| DELETE | `/me/library/artists/:id` | Unfollow artist       | Yes  |
| GET    | `/me/library/playlists`   | Lấy saved playlists   | Yes  |
| GET    | `/me/history`             | Lấy listening history | Yes  |
| GET    | `/me/recently-played`     | Lấy recently played   | Yes  |

---

### 9. Playback Module

Quản lý phát nhạc, queue, và đồng bộ giữa các thiết bị.

```
modules/playback/
├── playback.module.ts
├── playback.controller.ts
├── playback.service.ts
├── playback.gateway.ts           # WebSocket gateway
├── entities/
│   ├── playback-state.entity.ts
│   └── playback-queue.entity.ts
├── dto/
│   ├── update-playback.dto.ts
│   ├── add-to-queue.dto.ts
│   └── playback-state.dto.ts
└── interfaces/
    └── playback.interface.ts
```

#### API Endpoints

| Method | Endpoint              | Description                      | Auth |
| ------ | --------------------- | -------------------------------- | ---- |
| GET    | `/me/player`          | Lấy playback state hiện tại      | Yes  |
| PUT    | `/me/player`          | Cập nhật playback state          | Yes  |
| PUT    | `/me/player/play`     | Play                             | Yes  |
| PUT    | `/me/player/pause`    | Pause                            | Yes  |
| POST   | `/me/player/next`     | Next track                       | Yes  |
| POST   | `/me/player/previous` | Previous track                   | Yes  |
| PUT    | `/me/player/seek`     | Seek to position                 | Yes  |
| PUT    | `/me/player/volume`   | Set volume                       | Yes  |
| PUT    | `/me/player/shuffle`  | Toggle shuffle (normal/smart)    | Yes  |
| PUT    | `/me/player/repeat`   | Toggle repeat mode               | Yes  |
| GET    | `/me/player/queue`    | Lấy queue                        | Yes  |
| POST   | `/me/player/queue`    | Thêm vào queue                   | Yes  |
| DELETE | `/me/player/queue`    | Xóa queue                        | Yes  |
| GET    | `/me/player/devices`  | Lấy available devices            | Yes  |
| PUT    | `/me/player/transfer` | Chuyển playback sang device khác | Yes  |

#### WebSocket Events

```typescript
// Client -> Server
"player:play";
"player:pause";
"player:seek";
"player:next";
"player:previous";
"player:shuffle";
"player:repeat";
"player:volume";
"player:transfer";

// Server -> Client
"player:state-changed";
"player:track-changed";
"player:device-connected";
"player:device-disconnected";
"queue:updated";
```

---

### 10. Sync Module

Đồng bộ dữ liệu giữa các thiết bị.

```
modules/sync/
├── sync.module.ts
├── sync.controller.ts
├── sync.service.ts
├── sync.gateway.ts               # WebSocket for real-time sync
├── entities/
│   ├── device-sync-state.entity.ts
│   ├── sync-log.entity.ts
│   └── device-transfer.entity.ts
└── dto/
    └── sync-request.dto.ts
```

#### API Endpoints

| Method | Endpoint        | Description               | Auth |
| ------ | --------------- | ------------------------- | ---- |
| GET    | `/sync/state`   | Lấy sync state của device | Yes  |
| POST   | `/sync/pull`    | Pull changes từ server    | Yes  |
| POST   | `/sync/push`    | Push changes lên server   | Yes  |
| GET    | `/sync/devices` | Lấy connected devices     | Yes  |

---

### 11. Subscriptions Module

Quản lý gói đăng ký và thanh toán.

```
modules/subscriptions/
├── subscriptions.module.ts
├── subscriptions.controller.ts
├── subscriptions.service.ts
├── entities/
│   ├── subscription-plan.entity.ts
│   └── user-subscription.entity.ts
├── dto/
│   ├── subscribe.dto.ts
│   └── subscription-response.dto.ts
└── interfaces/
    └── subscription.interface.ts
```

#### API Endpoints

| Method | Endpoint                    | Description               | Auth |
| ------ | --------------------------- | ------------------------- | ---- |
| GET    | `/subscriptions/plans`      | Lấy danh sách plans       | No   |
| GET    | `/me/subscription`          | Lấy subscription hiện tại | Yes  |
| POST   | `/me/subscription`          | Đăng ký plan              | Yes  |
| PATCH  | `/me/subscription`          | Thay đổi plan             | Yes  |
| DELETE | `/me/subscription`          | Hủy subscription          | Yes  |
| GET    | `/me/subscription/features` | Lấy features của plan     | Yes  |

---

### 12. Ads Module

Quản lý quảng cáo cho Free users.

```
modules/ads/
├── ads.module.ts
├── ads.controller.ts
├── ads.service.ts
├── entities/
│   ├── advertisement.entity.ts
│   ├── ad-impression.entity.ts
│   └── user-ad-settings.entity.ts
├── dto/
│   ├── ad-response.dto.ts
│   └── ad-impression.dto.ts
└── interfaces/
    └── ad.interface.ts
```

#### API Endpoints

| Method | Endpoint              | Description                          | Auth |
| ------ | --------------------- | ------------------------------------ | ---- |
| GET    | `/ads/next`           | Lấy quảng cáo tiếp theo (Free users) | Yes  |
| POST   | `/ads/:id/impression` | Track ad impression                  | Yes  |
| POST   | `/ads/:id/click`      | Track ad click                       | Yes  |
| POST   | `/ads/:id/skip`       | Track ad skip                        | Yes  |
| POST   | `/ads/:id/complete`   | Track ad complete                    | Yes  |

---

### 13. Search Module

Tìm kiếm toàn bộ nội dung.

```
modules/search/
├── search.module.ts
├── search.controller.ts
├── search.service.ts
└── dto/
    └── search-response.dto.ts
```

#### API Endpoints

| Method | Endpoint              | Description                                       | Auth |
| ------ | --------------------- | ------------------------------------------------- | ---- |
| GET    | `/search`             | Search tất cả (songs, artists, albums, playlists) | No   |
| GET    | `/search/songs`       | Search songs                                      | No   |
| GET    | `/search/artists`     | Search artists                                    | No   |
| GET    | `/search/albums`      | Search albums                                     | No   |
| GET    | `/search/playlists`   | Search playlists                                  | No   |
| GET    | `/search/suggestions` | Lấy search suggestions                            | No   |

---

### 14. Upload Module

Quản lý upload files (audio, images).

```
modules/upload/
├── upload.module.ts
├── upload.controller.ts
├── upload.service.ts
├── strategies/
│   ├── s3.strategy.ts
│   └── cloudinary.strategy.ts
└── dto/
    └── upload-response.dto.ts
```

#### API Endpoints

| Method | Endpoint        | Description       | Auth         |
| ------ | --------------- | ----------------- | ------------ |
| POST   | `/upload/audio` | Upload audio file | Admin/Artist |
| POST   | `/upload/image` | Upload image      | Yes          |
| DELETE | `/upload/:id`   | Xóa file          | Admin        |

---

## Entity Relationships (TypeORM)

### User Entity Example

```typescript
// entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum SubscriptionType {
  FREE = "free",
  PREMIUM = "premium",
  FAMILY = "family",
}

export enum UserRole {
  USER = "user",
  ARTIST = "artist",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: "date", nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  country: string;

  @Column({
    type: "enum",
    enum: SubscriptionType,
    default: SubscriptionType.FREE,
  })
  subscriptionType: SubscriptionType;

  @Column({ default: false })
  isArtist: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => UserOAuth, (oauth) => oauth.user)
  oauthAccounts: UserOAuth[];

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => UserDevice, (device) => device.user)
  devices: UserDevice[];

  @OneToMany(() => Playlist, (playlist) => playlist.user)
  playlists: Playlist[];

  @OneToMany(() => UserSubscription, (sub) => sub.user)
  subscriptions: UserSubscription[];
}
```

---

## Authentication Flow

### JWT Authentication

```typescript
// JWT Payload
interface JwtPayload {
  sub: string; // User ID
  email: string;
  username: string;
  subscriptionType: SubscriptionType;
  deviceId?: string;
  iat: number;
  exp: number;
}

// Access Token: 15 minutes
// Refresh Token: 7 days (stored in HttpOnly cookie)
```

### OAuth Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant G as Google/Facebook

    C->>S: GET /auth/google
    S->>G: Redirect to Google
    C->>G: Login with Google
    G->>C: Redirect with code
    C->>S: GET /auth/google/callback?code=xxx
    S->>G: Exchange code for token
    G->>S: Return user info
    S->>S: Create/Update user
    S->>S: Create session
    S->>C: Redirect to Frontend (APP_FRONTEND_URL) with JWT tokens
    C->>C: Parse URL, Save Tokens, Login Success
```

---

## Guards & Decorators

### Custom Decorators

```typescript
// @CurrentUser() - Get current user from request
@Get('me')
getProfile(@CurrentUser() user: User) {
  return user;
}

// @Public() - Bypass authentication
@Public()
@Get('public-data')
getPublicData() { }

// @Roles() - Role-based access
@Roles(Role.ADMIN)
@Post('admin-only')
adminAction() { }

// @Premium() - Premium users only
@Premium()
@Get('premium-feature')
premiumFeature() { }
```

### Guards

```typescript
// JwtAuthGuard - Validate JWT token
// PremiumGuard - Check if user has premium subscription
// RolesGuard - Check user roles
// ThrottlerGuard - Rate limiting
```

---

## Error Handling

### Custom Exceptions

```typescript
// Custom exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server error";

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ],
  "timestamp": "2026-01-27T12:00:00.000Z"
}
```

---

## Caching Strategy

### Redis Cache

```typescript
// Cache keys
const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  ARTIST: (id: string) => `artist:${id}`,
  ALBUM: (id: string) => `album:${id}`,
  SONG: (id: string) => `song:${id}`,
  PLAYLIST: (id: string) => `playlist:${id}`,
  PLAYBACK: (userId: string) => `playback:${userId}`,
  SEARCH: (query: string) => `search:${query}`,
};

// TTL
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 1 day
};
```

---

## Rate Limiting

```typescript
// Rate limits per endpoint type
const RATE_LIMITS = {
  PUBLIC: { ttl: 60, limit: 100 }, // 100 req/min
  AUTHENTICATED: { ttl: 60, limit: 300 }, // 300 req/min
  STREAMING: { ttl: 60, limit: 60 }, // 60 req/min (1 per second)
  SEARCH: { ttl: 60, limit: 30 }, // 30 req/min
};
```

---

## Environment Variables

```env
# App
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/melodix

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth - Google
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# OAuth - Facebook
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=melodix-media
AWS_S3_REGION=ap-southeast-1

# Cloudinary (alternative)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## Implementation Checklist

### Phase 1: Core Setup

- [ ] Initialize NestJS project
- [ ] Setup PostgreSQL + TypeORM/Prisma
- [ ] Setup Redis
- [ ] Configure environment variables
- [ ] Setup Swagger documentation

### Phase 2: Authentication

- [ ] Implement JWT authentication
- [ ] Implement Google OAuth
- [ ] Implement Facebook OAuth
- [ ] Session management
- [ ] Device management

### Phase 3: Core Modules

- [ ] Users module
- [ ] Artists module
- [ ] Albums module
- [ ] Songs module
- [ ] Genres module
- [ ] Playlists module

### Phase 4: User Features

- [ ] Library (likes, follows)
- [ ] Listening history
- [ ] Search functionality

### Phase 5: Playback & Sync

- [ ] Playback state management
- [ ] Queue management
- [ ] WebSocket for real-time sync
- [ ] Device transfer

### Phase 6: Subscription & Ads

- [ ] Subscription plans
- [ ] Payment integration
- [ ] Ad serving for free users
- [ ] Smart shuffle (premium only)

### Phase 7: Deployment

- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] Monitoring & logging
- [ ] Performance optimization
