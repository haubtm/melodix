"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import FallbackImage from "@/components/common/FallbackImage";
import { searchAll } from "@/api/search";
import type { SearchResults } from "@/api/search";
import {
  clearSearchHistory,
  createAlbumHistoryItem,
  createArtistHistoryItem,
  createPlaylistHistoryItem,
  createQueryHistoryItem,
  createSongHistoryItem,
  getSearchHistory,
  saveSearchHistoryItem,
  type SearchHistoryItem,
} from "@/features/main/search/history";
import styles from "./SearchBox.module.css";

function buildSuggestions(results: SearchResults): SearchHistoryItem[] {
  return [
    ...results.songs.slice(0, 4).map(createSongHistoryItem),
    ...results.artists.slice(0, 2).map(createArtistHistoryItem),
    ...results.albums.slice(0, 2).map(createAlbumHistoryItem),
    ...results.playlists.slice(0, 2).map(createPlaylistHistoryItem),
  ].slice(0, 8);
}

export default function SearchBox() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentQuery =
    pathname === "/search" ? searchParams.get("q")?.trim() || "" : "";

  const [value, setValue] = useState(currentQuery);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    setHistoryItems(getSearchHistory());
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchAll({
          query: trimmedValue,
          songLimit: 4,
          artistLimit: 2,
          albumLimit: 2,
          playlistLimit: 2,
        });

        if (isMounted) {
          setSuggestions(buildSuggestions(results));
        }
      } catch {
        if (isMounted) {
          setSuggestions([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [value]);

  const visibleItems = useMemo(() => {
    return value.trim() ? suggestions : historyItems;
  }, [historyItems, suggestions, value]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      router.push("/search");
      setOpen(false);
      return;
    }

    const item = createQueryHistoryItem(trimmedValue);
    saveAndSyncHistory(item);
    router.push(item.href);
    setOpen(false);
  };

  const saveAndSyncHistory = (item: SearchHistoryItem) => {
    saveSearchHistoryItem(item);
    setHistoryItems(getSearchHistory());
  };

  const handleSelectItem = (item: SearchHistoryItem) => {
    saveAndSyncHistory(item);
    setValue(item.query);
    router.push(item.href);
    setOpen(false);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistoryItems([]);
  };

  return (
    <div ref={wrapperRef} className={styles.searchShell}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div
          className={`${styles.inputWrapper} ${
            focused || open ? styles.inputWrapperFocused : ""
          }`}
        >
          <SearchOutlined className={styles.searchIcon} />
          <input
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setFocused(true);
              setOpen(true);
              setHistoryItems(getSearchHistory());
            }}
            placeholder="Bạn muốn phát nội dung gì?"
            className={styles.input}
          />
          {value && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setValue("");
                if (pathname === "/search") {
                  router.replace("/search");
                }
              }}
            >
              <CloseOutlined />
            </button>
          )}
        </div>
      </form>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3 className={styles.dropdownTitle}>
              {value.trim() ? "Gợi ý tìm kiếm" : "Các tìm kiếm gần đây"}
            </h3>
            {!value.trim() && historyItems.length > 0 && (
              <button
                type="button"
                className={styles.clearHistory}
                onClick={handleClearHistory}
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.emptyText}>Đang tải gợi ý...</div>
          ) : visibleItems.length > 0 ? (
            <div className={styles.resultList}>
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.resultItem}
                  onClick={() => handleSelectItem(item)}
                >
                  {item.imageUrl ? (
                    <FallbackImage
                      src={item.imageUrl}
                      fallbackSrc={
                        item.type === "artist"
                          ? "/images/default-artist.svg"
                          : "/images/default-cover.svg"
                      }
                      alt={item.title}
                      width={48}
                      height={48}
                      className={`${styles.resultThumb} ${
                        item.type === "artist" ? styles.artistThumb : ""
                      }`}
                    />
                  ) : (
                    <span className={styles.resultIcon}>
                      <SearchOutlined />
                    </span>
                  )}
                  <span className={styles.resultBody}>
                    <span className={styles.resultTitle}>{item.title}</span>
                    <span className={styles.resultSubtitle}>{item.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.emptyText}>
              {value.trim()
                ? "Không có gợi ý nào phù hợp."
                : "Chưa có lịch sử tìm kiếm."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
