---
description: Guide to implementing a new NestJS Module in Melodix (Controller, Service, Repository, DTOs, Tests)
---

# Implement NestJS Module Workflow

This workflow outlines the standard process for creating a new feature module in the Melodix backend.

## 1. Preparation & Schema Analysis

- [ ] **Analyze Schema**: Read `prisma/schema.prisma` to understand the data model for the new module.
  - Identify relations (e.g., `User`, `Artist`) and required fields.
  - Determine `Soft Delete` (isActive) or `Hard Delete` support.
- [ ] **Access Control**: Determine requirements (Who can Create/Read/Update/Delete).

## 2. Initialize Module Structure

// turbo

- [ ] **Create Directories**:
  ```bash
  mkdir -p backend/src/modules/[module-name]/controller backend/src/modules/[module-name]/service backend/src/modules/[module-name]/repository backend/src/modules/[module-name]/dto backend/src/modules/[module-name]/entity
  ```
- [ ] **Create Module File**: `src/modules/[module-name]/[module-name].module.ts`.

## 3. Define DTOs & Entity

Follow standard naming conventions and extend from base DTOs where applicable.

### Entity (`entity/[name].entity.ts`)

- [ ] Implement class matching Prisma model.
- [ ] Export in `entity/index.ts`.

### DTOs (`dto/`)

- [ ] **CreateDTO** (`create-[name].dto.ts`):
  - Use `class-validator` (`IsString`, `IsOptional`, `IsInt`, `IsNotEmpty`).
  - Use `@ApiProperty` for Swagger.
- [ ] **UpdateDTO** (`update-[name].dto.ts`): Extend `PartialType(CreateDTO)`.
- [ ] **ResponseDTO** (`[name]-response.dto.ts`):
  - Implement `constructor` to map Entity -> DTO.
  - Use `@Exclude` / `@Expose` if sensitive data exists.
- [ ] **ListDTO** (`[name]-list.dto.ts`):
  - Extend `BaseListDto` from `common/dto`.
  - Add specific filters (e.g., `isPublished`, `genre`).
  - Add `search` override with example fields.
- [ ] **Index**: Export all in `dto/index.ts`.

## 4. Implement Repository

- [ ] Class: `[Name]Repository`.
- [ ] Inject `PrismaService`.
- [ ] Methods:
  - `create(data)`
  - `findAll(params: { skip, take, where, orderBy })`
  - `findById(id)`
  - `findByUserId(userId)` (for ownership checks)
  - `findBySlug(slug)` (if applicable)
  - `update(id, data)`
  - `delete(id)` (or `softDelete` if supported)
  - `deleteMany(ids)` (or `softDeleteMany`)
  - `count(where)`

## 5. Implement Service

- [ ] Class: `[Name]Service`.
- [ ] Inject `[Name]Repository`.
- [ ] Implement CRUD logic:
  - **Create**:
    - Handle unique constraints (e.g., Slug generation).
    - **Check Logical Duplicates**: Verify if user already has an entity (e.g., Artist Profile). Throw `BadRequestException`.
  - **FindAll**:
    - Map `ListDto` to Prisma `where`.
    - Handle Search logic (`OR` conditions).
    - Use `PaginatedResponseDto`.
  - **Update**:
    - **CRITICAL**: Implement Ownership Check if applicable (`artist.userId !== currentUserId`).
    - Check for duplicate slug if slug is updated.
  - **Delete/DeleteMany**:
    - **Ownership Check**: Verify existence AND `entity.userId === currentUserId`.
    - Allow Admin to bypass ownership check.
    - Throw `NotFoundException`.

## 6. Implement Controller

- [ ] Class: `[Name]Controller`.
- [ ] Decorators: `@ApiTags('[names]')`, `@Controller('[names]')`, `@ApiBearerAuth()`.
- [ ] **Routes**:
  - `POST /` (Create) - `@Roles(UserRole.admin)` or appropriate role.
  - `POST /list` (FindAll) - **Public** (usually). Use `HttpCode(200)`.
  - `GET /:id` (FindOne) - **Public** or Protected.
  - `PATCH /:id` (Update) - Protected. Use `@GetUser()` to pass `currentUserId` to Service for ownership check.
  - `DELETE /:id` (Delete) - Admin or Owner. Pass `currentUserId` to Service.
  - `DELETE /many` (Delete Many) - Admin only.
- [ ] **Guards**: Apply `JwtAuthGuard`, `RolesGuard` specifically to protected routes.

## 7. Module Registration

- [ ] Register Controller, Service, Repository in `[Name]Module`.
- [ ] Import `[Name]Module` in `AppModule`.

## 8. Unit Testing

- [ ] Create `[name].service.spec.ts`.
  - Mock Repository using `jest.fn()`.
  - Test complex logic (slug gen, ownership check).
- [ ] Create `[name].controller.spec.ts`.
  - Mock Service.
  - Add `/* eslint-disable @typescript-eslint/unbound-method */` to top of file.
- [ ] Run tests: `npm run test src/modules/[module-name]`

## 9. Final Review

- [ ] Verify Swagger Documentation (`http://localhost:3000/docs`).
- [ ] Check for Lint errors (`npm run lint` optional).
- [ ] Update `backend_status.md` with new module status.
