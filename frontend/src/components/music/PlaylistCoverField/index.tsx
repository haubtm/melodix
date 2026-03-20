"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { App, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { PictureOutlined } from "@ant-design/icons";
import styles from "./PlaylistCoverField.module.css";

interface PlaylistCoverFieldProps {
  label?: string;
  fileList: UploadFile[];
  initialImageUrl?: string;
  onChange: (files: UploadFile[]) => void;
}

const MAX_FILE_SIZE_MB = 2;

export default function PlaylistCoverField({
  label = "Ảnh bìa playlist",
  fileList,
  initialImageUrl,
  onChange,
}: PlaylistCoverFieldProps) {
  const { message } = App.useApp();
  const localPreview = useMemo(() => {
    const file = fileList[0]?.originFileObj;
    return file ? URL.createObjectURL(file) : null;
  }, [fileList]);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const previewUrl = useMemo(
    () => localPreview || initialImageUrl || null,
    [initialImageUrl, localPreview],
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>{label}</div>
      <div className={styles.picker}>
        <Upload
          accept="image/png,image/jpeg,image/jpg,image/webp"
          listType="picture-card"
          maxCount={1}
          fileList={fileList}
          beforeUpload={(file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
              message.error("Chỉ chấp nhận file ảnh.");
              return Upload.LIST_IGNORE;
            }

            const isWithinLimit = file.size / 1024 / 1024 <= MAX_FILE_SIZE_MB;
            if (!isWithinLimit) {
              message.error(`Ảnh phải nhỏ hơn ${MAX_FILE_SIZE_MB}MB.`);
              return Upload.LIST_IGNORE;
            }

            return false;
          }}
          onChange={({ fileList: nextFileList }) => onChange(nextFileList.slice(-1))}
          showUploadList={false}
        >
          {previewUrl ? (
            <div className={styles.preview}>
              <Image src={previewUrl} alt="Playlist cover preview" fill unoptimized />
              <div className={styles.overlay}>
                <div className={styles.cta}>Chọn ảnh khác</div>
              </div>
            </div>
          ) : (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>
                  <PictureOutlined />
                </div>
                <div className={styles.emptyTitle}>Thêm ảnh bìa</div>
                <div className={styles.emptyText}>Chọn ảnh từ máy</div>
              </div>
          )}
        </Upload>
      </div>
    </div>
  );
}
