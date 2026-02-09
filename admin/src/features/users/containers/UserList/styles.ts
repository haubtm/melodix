import styled from "styled-components";
import { Card, Button, Avatar } from "antd";

export const Container = styled.div`
  padding: 24px;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

export const Filters = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

export const StyledCard = styled(Card)`
  .ant-table-wrapper {
    overflow-x: auto;
  }
`;

export const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const UserName = styled.span`
  font-weight: 500;
`;

export const UserEmail = styled.span`
  font-size: 12px;
  color: #888;
`;

export const StyledAvatar = styled(Avatar)`
  flex-shrink: 0;
`;

export const ActionButton = styled(Button)`
  padding: 4px 8px;
`;
