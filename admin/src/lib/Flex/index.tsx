"use client";

import styled from "styled-components";

interface FlexProps {
  $direction?: "row" | "column" | "row-reverse" | "column-reverse";
  $justify?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
  $align?: "flex-start" | "flex-end" | "center" | "stretch" | "baseline";
  $gap?: string | number;
  $wrap?: "nowrap" | "wrap" | "wrap-reverse";
  $flex?: string | number;
}

const Flex = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${({ $direction }) => $direction || "row"};
  justify-content: ${({ $justify }) => $justify || "flex-start"};
  align-items: ${({ $align }) => $align || "stretch"};
  gap: ${({ $gap }) => (typeof $gap === "number" ? `${$gap}px` : $gap || "0")};
  flex-wrap: ${({ $wrap }) => $wrap || "nowrap"};
  flex: ${({ $flex }) => $flex || "initial"};
`;

export default Flex;
