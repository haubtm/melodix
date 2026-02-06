"use client";

import styled from "styled-components";
import { Flex } from "@/lib";

export const Root = styled.div`
  padding: 24px;
`;

export const Header = styled(Flex)`
  margin-bottom: 24px;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
`;

export const FilterCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

export const TableCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
`;

export const SongCell = styled(Flex)`
  gap: 12px;
  align-items: center;
`;

export const SongInfo = styled(Flex)`
  flex-direction: column;
  gap: 2px;
`;

export const SongTitle = styled.span`
  font-weight: 500;
  color: #1a1a2e;
`;

export const SongArtist = styled.span`
  font-size: 12px;
  color: #6b7280;
`;
