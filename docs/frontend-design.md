# Frontend Design

## Mục tiêu

Tài liệu này mô tả kiến trúc hiện tại của `frontend` sau giai đoạn refactor nền:

- Đồng bộ hướng tổ chức code với `admin`
- Ưu tiên SEO và SSR/ISR ngay từ đầu
- Chuẩn hóa flow xác thực, session và protected routes
- Giữ khả năng mở rộng cho các module user-facing như profile, library, player, playlist

Thư mục áp dụng:

- `D:\STUDY\New folder\melodix\frontend`

---

## Cấu trúc thư mục hiện tại

```text
frontend/src
├─ api
├─ app
├─ common
├─ components
├─ dtos
├─ features
├─ lib
├─ providers
├─ store
└─ types
```

### Ý nghĩa từng phần

- `api`
  - Data layer cấp ứng dụng
  - Chứa `axiosService`, API client và server fetch helper cho SSR
- `app`
  - Next.js App Router
  - Chứa route groups như `(auth)` và `(protected)`
- `common`
  - Cấu hình dùng chung, ví dụ `seo.ts`
- `components`
  - UI component dùng lại theo hướng layout/presentation
- `dtos`
  - Kiểu dữ liệu và contract frontend
  - Đây là nguồn type chính, thay thế dần `types`
- `features`
  - Nơi tổ chức business module theo domain, giống `admin`
- `lib`
  - Tạm giữ backward compatibility cho code cũ
  - Về lâu dài nên giảm vai trò, ưu tiên dùng trực tiếp `api`, `dtos`, `features`
- `providers`
  - Redux, React Query, AntD
- `store`
  - Redux store và slices
- `types`
  - Hiện chỉ re-export từ `dtos` để tránh vỡ import cũ

---

## Nguyên tắc tổ chức module

Frontend sẽ đi theo pattern gần giống `admin`:

```text
src
├─ api
├─ dtos
├─ features
│  ├─ auth
│  ├─ main
│  └─ ...
├─ providers
└─ store
```

### Quy ước

- `page.tsx` trong `app` nên mỏng
  - chỉ lo route, metadata, SSR fetch cơ bản
- Logic UI/flow nên nằm trong `features/.../containers`
- Hooks React Query nên nằm trong:
  - `features/<module>/react-query/hooks`
- Mọi contract response/request nên định nghĩa trong `dtos`
- API không gọi trực tiếp trong component nếu có thể tách ra `features` hoặc `api`

---

## SSR và SEO

### Trạng thái hiện tại

Trang chủ `/` đang dùng App Router server component:

- file: `frontend/src/app/page.tsx`
- có `revalidate = 300`
- fetch dữ liệu qua `homeApi`
- có fallback an toàn khi backend lỗi:
  - `Promise.allSettled(...)`
  - nếu request fail, vẫn render trang với mảng rỗng

### Metadata

Global metadata:

- `frontend/src/app/layout.tsx`
- dùng `SITE_CONFIG` từ `frontend/src/common/seo.ts`

Hiện đã có:

- `metadataBase`
- `title template`
- `description`
- `keywords`
- `canonical`
- `openGraph`
- `twitter`

### Hướng phát triển tiếp

Các route public quan trọng cần ưu tiên SSR/ISR:

1. `song detail`
2. `album detail`
3. `artist detail`
4. `search` nếu muốn indexable theo query phổ biến

Nguyên tắc:

- Route public => ưu tiên server component + metadata
- Route auth/private => không cần SEO mạnh, ưu tiên UX và session correctness

---

## Ant Design SSR styles

### Vấn đề đã gặp

Ở dev mode có hiện tượng:

- HTML lên trước
- style AntD vào chậm một nhịp
- nhìn như “mất style rồi mới có lại”

### Cách xử lý hiện tại

Đã thêm:

- `frontend/src/providers/Antd/AntdStyleRegistry.tsx`

và bọc vào:

- `frontend/src/providers/Antd/index.tsx`

Mục tiêu:

- inject CSS của AntD ngay từ server HTML
- giảm FOUC khi reload

Lưu ý:

- dev mode với Turbopack vẫn có thể nháy nhẹ
- production build sẽ ổn hơn đáng kể

---

## Auth flow

### Kiến trúc hiện tại

Auth được chia thành:

- API:
  - `frontend/src/api/auth.ts`
  - `frontend/src/api/axiosService.ts`
- Feature:
  - `frontend/src/features/auth/...`
- Store:
  - `frontend/src/store/slices/authSlice.ts`
- Provider hydrate:
  - `frontend/src/providers/Redux/index.tsx`

### Luồng session

1. Login/Register/Verify thành công
   - dispatch `setCredentials`
   - lưu:
     - `accessToken`
     - `refreshToken`
     - `authUser`
2. Reload app
   - `initializeAuth()` hydrate từ localStorage
3. Sau hydrate
   - provider gọi `GET /auth/me`
   - nếu thành công:
     - đồng bộ lại `user + tokens`
   - nếu thất bại:
     - logout sạch

### Refresh token

`axiosService` hiện có:

- tự gắn access token vào request
- intercept `401`
- gọi `/auth/refresh`
- retry request cũ
- tránh refresh loop ở các auth route như:
  - `/auth/login`
  - `/auth/register`
  - `/auth/verify-email`
  - `/auth/refresh`

### Endpoint backend đang dùng

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/verify-email`
- `POST /auth/refresh`
- `GET /auth/me`

### Ghi chú

Backend `GET /auth/me` hiện trả:

- user profile
- `accessToken`
- `refreshToken`

Frontend đã normalize để chịu được cả response trực tiếp hoặc response bọc `data`

---

## Auth routes và protected routes

### Route groups hiện tại

- `frontend/src/app/(auth)`
  - `login`
  - `register`
- `frontend/src/app/(protected)`
  - `profile`
  - `settings`
  - `library/liked`

### Guard hiện tại

Auth-only group:

- `frontend/src/app/(auth)/layout.tsx`
- nếu đã đăng nhập thì redirect về `/`

Protected group:

- `frontend/src/app/(protected)/layout.tsx`
- dùng `RequireAuth`

Component guard:

- `frontend/src/features/auth/components/RequireAuth/index.tsx`

### Quy tắc mở rộng

Mọi route cần đăng nhập trong tương lai nên đặt dưới:

- `frontend/src/app/(protected)/...`

Ví dụ:

- `library`
- `playlist/create`
- `account`
- `notifications`

Không nên tự viết guard lẻ ở từng page nếu route đã nằm trong `(protected)`

---

## Features hiện tại

### `features/auth`

Đã có:

- `containers/Login`
- `containers/Register`
- `react-query/hooks`
- `RequireAuth`

Nguyên tắc:

- `app/(auth)/.../page.tsx` chỉ render container
- logic submit, mutation, redirect nằm trong feature

### `features/main`

Đã có:

- `HomeContainer`
- `ProtectedPageShell`

`ProtectedPageShell` là placeholder dùng chung cho các page private mới tạo, chỉ để route không còn rỗng. Khi làm thật từng module thì thay shell này bằng container chuyên biệt.

---

## Components

### Layout

- `components/layout/MainLayout`
- `components/layout/Header`
- `components/layout/Sidebar`
- `components/layout/MusicPlayer`

Đây vẫn là tầng presentation/UI chung, chưa refactor sâu theo feature.

### Music domain components

- `components/music/SongCard`
- `components/music/AlbumCard`
- `components/music/ArtistCard`

Các component này vẫn là client component do có tương tác player/store.

---

## `lib` và backward compatibility

Hiện `lib/api/*` vẫn còn tồn tại để tránh vỡ code cũ.

Ví dụ:

- `lib/api/auth.ts`
- `lib/api/songs.ts`

Hướng chuẩn trong code mới:

- ưu tiên import từ `@/api`
- ưu tiên import types từ `@/dtos`

Mục tiêu dài hạn:

- giảm dần dependency vào `lib/api`
- chuyển code sang dùng trực tiếp `api` và `features`

---

## Quy ước cho các bước phát triển tiếp theo

### Khi thêm route public mới

Nên làm theo thứ tự:

1. thêm DTO nếu cần
2. thêm API client trong `src/api`
3. thêm server helper nếu route cần SSR
4. thêm container trong `features`
5. `page.tsx` chỉ fetch + render container
6. thêm metadata

### Khi thêm route private mới

1. tạo route dưới `src/app/(protected)/...`
2. tạo container trong `features/...`
3. không viết guard riêng nếu đã nằm dưới `(protected)`

### Khi thêm flow auth mới

Ví dụ:

- forgot password
- reset password
- social callback

Nên đặt trong:

- `src/features/auth`
- `src/api/auth.ts`
- `src/dtos/auth`

### Khi thêm module user-facing lớn

Ví dụ:

- profile
- settings
- liked songs
- playlists

Nên tạo feature riêng:

```text
src/features/profile
src/features/settings
src/features/library
src/features/playlists
```

Không nên dồn toàn bộ vào `features/main`

---

## Các việc còn thiếu

Những phần hiện chưa hoàn thiện nhưng đã có nền:

1. `forgot-password / reset-password`
2. social login callback
3. route detail:
   - song
   - album
   - artist
4. dùng React Query hooks theo module thay vì gọi API trực tiếp ở nhiều nơi
5. thay placeholder pages trong `(protected)` bằng tính năng thật
6. chuẩn hóa thêm UI component để giảm logic trong `components/layout`

---

## Checklist khi phát triển tiếp

- route public có SSR/metadata chưa?
- type có nằm trong `dtos` chưa?
- page có mỏng và chỉ làm nhiệm vụ route chưa?
- logic có nằm trong `features` chưa?
- route private đã đặt trong `(protected)` chưa?
- auth flow có reuse `authApi` và `authSlice` không?
- build/lint có pass không?

---

## File quan trọng cần nhớ

- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/(auth)/layout.tsx`
- `frontend/src/app/(protected)/layout.tsx`
- `frontend/src/api/axiosService.ts`
- `frontend/src/api/auth.ts`
- `frontend/src/api/server-home.ts`
- `frontend/src/common/seo.ts`
- `frontend/src/features/auth/index.ts`
- `frontend/src/features/main/index.ts`
- `frontend/src/providers/Antd/AntdStyleRegistry.tsx`
- `frontend/src/providers/Redux/index.tsx`
- `frontend/src/store/slices/authSlice.ts`

---

## Kết luận

Frontend hiện đã có nền đủ tốt để tiếp tục phát triển theo hướng:

- module-based
- SSR-first cho public pages
- auth/session ổn định hơn
- protected route rõ ràng

Mọi bước tiếp theo nên bám theo cấu trúc trong tài liệu này để tránh quay lại kiểu tổ chức cũ `components + lib/api + page logic trộn lẫn`.
