"use client";

import styled from "styled-components";
import { Flex } from "@/lib";

export const Root = styled(Flex)`
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #001529 0%, #003a8c 100%);
  padding: 24px;
`;

export const LoginCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

export const Logo = styled(Flex)`
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const Title = styled.h3`
  margin: 0;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: inherit;
`;

export const Subtitle = styled.span`
  display: block;
  text-align: center;
  margin-bottom: 24px;
  color: #6b7280;
`;

export const AlertWrapper = styled.div`
  margin-bottom: 24px;
`;
