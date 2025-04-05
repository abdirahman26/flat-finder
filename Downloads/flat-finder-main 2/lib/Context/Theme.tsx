import { createGlobalStyle } from "styled-components";

export const LightTheme = {
  primary: "#C5FF00",
  secondary: "##C5FF00",
  background: "#FFFF",
  dark: "#22075E",
  accent: "#AAAAAA",
  text: "#000000",
  textSecondary: "#FFFF",
  hover: "#531dab",
  contrastText: "#9A9A9A",
  light: "#F9F0FF",
  greyMain: "#F0F0F0",
  warning: "#D12E2E",
  greyBackground: "#F5F5F5",
};

export type Theme = typeof LightTheme;

export const GlobalStyles = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif,din;
    transition: all 0.50s linear;
  }
`;
