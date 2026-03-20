"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Empty, Input, Pagination, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import MainLayout from "@/components/layout/MainLayout";
import SongCard from "@/components/music/SongCard";
import { Artist, Genre, IPaginatedResponse, Song } from "@/dtos";
import styles from "./SongsPage.module.css";

interface SongsPageContainerProps {
  songsResponse: IPaginatedResponse<Song>;
  artists: Artist[];
  genres: Genre[];
  filters: {
    q: string;
    artistId?: number;
    genreId?: number;
    page: number;
    limit: number;
  };
  copy?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    contentTitle?: string;
  };
}

export function SongsPageContainer({
  songsResponse,
  artists,
  genres,
  filters,
  copy,
}: SongsPageContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(filters.q);

  const artistOptions = useMemo(
    () =>
      artists.map((artist) => ({
        label: artist.name,
        value: artist.id,
      })),
    [artists],
  );

  const genreOptions = useMemo(
    () =>
      genres.map((genre) => ({
        label: genre.name,
        value: genre.id,
      })),
    [genres],
  );
  const meta = songsResponse.metadata || songsResponse.meta;
  const total = meta?.total ?? songsResponse.data.length;
  const currentPage = meta?.page ?? filters.page;
  const pageSize = meta?.limit ?? filters.limit;
  const totalPages =
    meta?.totalPages ?? Math.max(Math.ceil(total / Math.max(pageSize, 1)), 1);
  const eyebrow = copy?.eyebrow || "Thư viện công khai";
  const title = copy?.title || "Bài hát";
  const description =
    copy?.description ||
    "Duyệt bài hát đã phát hành, phát trực tiếp ngay từ danh sách và lọc nhanh theo nghệ sĩ hoặc thể loại mà không cần rời khỏi player.";
  const contentTitle = copy?.contentTitle || "Danh sách phát hành";

  const updateQuery = (patch: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
        return;
      }

      params.set(key, String(value));
    });

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateQuery({
      q: keyword.trim() || undefined,
      page: 1,
    });
  };

  const handleReset = () => {
    setKeyword("");
    router.push(pathname);
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>{description}</p>
          <div className={styles.summary}>
            <span className={styles.summaryItem}>
              {total} bài hát khả dụng
            </span>
            <span className={styles.summaryItem}>
              Stream qua backend proxy
            </span>
            <span className={styles.summaryItem}>
              Queue và playback tracking đang bật
            </span>
          </div>
        </section>

        <form className={styles.filters} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Tìm bài hát</span>
            <Input
              allowClear
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Tên bài hát..."
              className={styles.searchInput}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nghệ sĩ</span>
            <Select
              allowClear
              value={filters.artistId}
              onChange={(value) =>
                updateQuery({
                  artistId: value,
                  page: 1,
                })
              }
              options={artistOptions}
              placeholder="Tất cả nghệ sĩ"
              className={styles.select}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Thể loại</span>
            <Select
              allowClear
              value={filters.genreId}
              onChange={(value) =>
                updateQuery({
                  genreId: value,
                  page: 1,
                })
              }
              options={genreOptions}
              placeholder="Tất cả thể loại"
              className={styles.select}
            />
          </label>

          <div className={styles.actions}>
            <Button htmlType="submit" type="primary" className={styles.submitButton}>
              Áp dụng
            </Button>
            <Button onClick={handleReset} className={styles.resetButton}>
              Xóa lọc
            </Button>
          </div>
        </form>

        <section className={styles.content}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>{contentTitle}</h2>
            <span className={styles.contentMeta}>
              Trang {currentPage}/{totalPages}
            </span>
          </div>

          {songsResponse.data.length ? (
            <div className={styles.list}>
              {songsResponse.data.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  playlist={songsResponse.data}
                  index={(currentPage - 1) * pageSize + index}
                  showAlbum
                />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <Empty
                description={
                  <>
                    Không có bài hát khớp bộ lọc hiện tại.
                    {" "}
                    <Link href="/songs">Quay lại danh sách đầy đủ</Link>.
                  </>
                }
              />
            </div>
          )}

          {totalPages > 1 && (
            <div className={styles.paginationWrap}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                showSizeChanger={false}
                className={styles.pagination}
                onChange={(page) => updateQuery({ page })}
              />
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
