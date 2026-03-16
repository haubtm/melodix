# Melodix Admin Dashboard Architecture & Design

Đây là tài liệu tổng quan mô tả kiến trúc, công nghệ và cấu trúc dự án của trang web quản trị hệ thống **Melodix Admin**.

## 1. Công nghệ sử dụng (Technology Stack)

Hệ thống được xây dựng trên nền tảng Frontend hiện đại với các công nghệ lõi sau:
- **Framework hiển thị**: Next.js 14+ (App Router).
- **Ngôn ngữ**: TypeScript 100%.
- **Thư viện UI**: Ant Design (antd) + Styled Components.
- **Quản lý trạng thái server (Server State)**: `@tanstack/react-query` (version 5).
- **Quản lý trạng thái client (Client State)**: Redux Toolkit (`@reduxjs/toolkit`).
- **HTTP Client**: Axios.
- **Form validation & Icons**: Tích hợp sẵn thông qua *Ant Design UI components* và `@ant-design/icons`.

## 2. Cấu trúc thư mục (Directory Structure)

Dự án áp dụng mô hình Feature-Driven kết hợp với Layered Architecture để giữ cho mã nguồn dễ mở rộng và bảo trì. Các thư mục chính bên trong `admin/src`:

```
admin/src/
├── api/                  # Khởi tạo Axios Instance có kèm Interceptors (Xử lý token)
│   ├── axiosService.ts   # Cấu hình lõi (Base URL, Timeout, Request/Response Hooks)
│   ├── users.ts          # Định nghĩa Endpoint module Users
│   ├── auth.ts           # Định nghĩa Endpoint module Auth
│   └── ...
├── app/                  # Next.js App Router Pages
│   ├── login/page.tsx    # Trang không yêu cầu xác thực
│   └── dashboard/        # Các trang được bảo vệ bởi Role/Login state
│       ├── layout.tsx    # Bố cục chính (Sidebar, Header động theo route)
│       └── [module]/page # Chứa giao diện module cụ thể (users, albums, approvals, songs, vv)
├── common/             
│   └── constants.ts      # Các hằng số (Keys lưu JWT ở localStorage...)
├── components/           
│   ├── layout/           # Component tĩnh dùng chung (Sidebar, Header UI)
│   └── index.ts
├── dtos/                 # Khai báo cấu trúc Typescript (Data Transfer Objects)
│   ├── common.ts         # Chuẩn hoá Request Paginated, Search API structure { fields, data }
│   ├── [module]/index.ts # Định nghĩa interface cho request/response các module
├── features/             # Business Logic & Phân vùng ứng dụng
│   ├── auth/             # Mọi logic liên quan đến Auth/Login
│   └── main/             # Module lớn bao hàm CRUD dashboard
│       ├── containers/   # Giao diện Smart components (Chứa state, gọi Query Hooks)
│       ├── react-query/  # Các hook React Query dùng để call API lấy dữ liệu và mutation dữ liệu
│       └── store/        # (Nơi dự phòng UI Slice nếu cần)
├── lib/                  # Nơi xuất các UI Component tái sử dụng cao được trừu tượng hóa (Shared Abstractions)
│   ├── Table/            # Bảng chuẩn chứa sẵn logic phân trang & Multi-Select
│   ├── FormModal/        # Abstraction Modal + Form của Antd 
│   └── Flex/             # Hỗ trợ bố trí component với Flexbox
└── store/                # Nơi cấu hình Redux Global Store
    ├── index.ts          # Store entry (Provider)
    └── slices/
        ├── authSlice.ts  # Persist token và thông tin profile Admin, Artist
        └── uiSlice.ts    # Lưu client state (Collapse Sidebar toggles)
```

## 3. Kiến trúc luồng truy xuất dữ liệu & Tương tác API

Mọi tương tác từ Client với Server đều xuyên suốt qua 3 lớp: `Container UI` -> `React Query Hook` -> `Axios Service`.

### 3.1 Giao thức Call API Chuẩn

API List luôn chấp nhận Post Payload có khả năng Search & Filter mạnh mẽ theo các Interface Generic đã định nghĩa tại `dtos/common.ts`:

**Mô hình truy vấn chuẩn `PaginatedRequest`:**
```typescript
export interface SearchQuery {
  fields: string[];
  data: string;
}

export interface SortQuery {
  field: string;
  order: "ASC" | "DESC" | "asc" | "desc";
}

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  search?: SearchQuery;      // Nhận 1 cấu trúc JSON thay đổi động
  sorts?: SortQuery[];
}
```

### 3.2 Quy trình uỷ quyền (Authorization & Interceptor)
Khách hàng không bao giờ được phép gửi Request chay với JWT nếu không thông qua `axiosService.ts`.
- **Request Interceptor**: Token tự động được trích xuất từ Local Storage (`localStorage.getItem()`) vào Authorization Header.
- **Response Interceptor**: Bắt lỗi HTTP Error (VD: Error 401 thì xoá token ở Local Storage và ép tải lại router về màn `/login`).

## 4. Giao diện (User Interface & User Experience)

Tất cả component tái sử dụng đã được đồng nhất tại thư mục `/src/lib` thành một hệ thống Design Components thống nhất.
- `<CommonFormModal />`: Đảm bảo quy chuẩn Form + Modal, dễ dàng nạp `initialValues` có sẵn.
- `<Table />`: Render danh sách, bắt buộc xử lý thao tác `Xóa nhiều item (DeleteMany)`.
- `<Flex />`: Layout chia khung grid và block linh hoạt thay thế hoàn toàn thẻ `div` cơ bản hay component `<Space>` đã lỗi thời (deprecated của Ant Design).
- `Header Page Titles`: Tiêu đề tự động map với Route Pathname giúp dọn dẹp không gian hiển thị của Page.

## 5. Các Modules chính đang hiện hành
- **Dashboard**: Trang tổng hợp thông số.
- **Quản lý Users**: Quản lí Role, Gói định kỳ (Premium, Khởi tạo thủ công).
- **Quản lý Albums, Songs**: CRUD âm nhạc.
- **Duyệt bài (Approvals)**: Dành riêng cho Admin phê duyệt ca khúc do người dùng tự Upload/Deploy.

---
*Tài liệu này được tạo vào: Tháng 3, 2026. Admin Panel v0.1.0.*
