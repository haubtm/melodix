"use client";

import React from "react";
import { Typography, Skeleton, Row, Col, Empty } from "antd";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout";
import { SongCard, AlbumCard, ArtistCard } from "@/components/music";
import { songsApi, albumsApi, artistsApi } from "@/lib/api";
import styles from "./page.module.css";

const { Title } = Typography;

export default function HomePage() {
  // Fetch songs
  const { data: songsData, isLoading: songsLoading } = useQuery({
    queryKey: ["songs", { limit: 10 }],
    queryFn: () => songsApi.getAll({ limit: 10 }),
  });

  // Fetch albums
  const { data: albumsData, isLoading: albumsLoading } = useQuery({
    queryKey: ["albums", { limit: 6 }],
    queryFn: () => albumsApi.getAll({ limit: 6 }),
  });

  // Fetch artists
  const { data: artistsData, isLoading: artistsLoading } = useQuery({
    queryKey: ["artists", { limit: 6 }],
    queryFn: () => artistsApi.getAll({ limit: 6 }),
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <MainLayout>
      <div className={styles.container}>
        {/* Greeting */}
        <Title level={1} className={styles.greeting}>
          {getGreeting()}
        </Title>

        {/* Featured Songs Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Title level={2} className={styles.sectionTitle}>
              Bài hát phổ biến
            </Title>
          </div>

          {songsLoading ? (
            <div className={styles.songList}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} active avatar paragraph={{ rows: 1 }} />
              ))}
            </div>
          ) : songsData?.data?.length ? (
            <div className={styles.songList}>
              {songsData.data.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  playlist={songsData.data}
                  index={index}
                  showAlbum
                />
              ))}
            </div>
          ) : (
            <Empty description="Chưa có bài hát nào" />
          )}
        </section>

        {/* Albums Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Title level={2} className={styles.sectionTitle}>
              Album nổi bật
            </Title>
          </div>

          {albumsLoading ? (
            <Row gutter={[24, 24]}>
              {[...Array(6)].map((_, i) => (
                <Col key={i} xs={12} sm={8} md={6} lg={4}>
                  <Skeleton.Image
                    active
                    style={{ width: "100%", height: 180 }}
                  />
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Col>
              ))}
            </Row>
          ) : albumsData?.data?.length ? (
            <div className={styles.cardGrid}>
              {albumsData.data.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          ) : (
            <Empty description="Chưa có album nào" />
          )}
        </section>

        {/* Artists Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Title level={2} className={styles.sectionTitle}>
              Nghệ sĩ phổ biến
            </Title>
          </div>

          {artistsLoading ? (
            <Row gutter={[24, 24]}>
              {[...Array(6)].map((_, i) => (
                <Col key={i} xs={12} sm={8} md={6} lg={4}>
                  <Skeleton.Avatar active size={180} shape="circle" />
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Col>
              ))}
            </Row>
          ) : artistsData?.data?.length ? (
            <div className={styles.cardGrid}>
              {artistsData.data.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <Empty description="Chưa có nghệ sĩ nào" />
          )}
        </section>
      </div>
    </MainLayout>
  );
}
