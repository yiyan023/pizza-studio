import { themes, tokens } from "@tamagui/themes";
import { createFont, createTamagui } from "tamagui";
const OpenSansFont = createFont({
  family: "OpenSans-Regular",
  size: {
    heading1: 24,
    heading2: 18,
    main: 16,
    normal: 14,
    small: 12,
    true: 15,
  },
  lineHeight: {
    1: 12,
    2: 15,
    true: 12,
  },
  weight: {
    normal: "400",
    bold: "700",
    true: "400",
  },
  letterSpacing: {
    1: 0,
    2: -0.5,
    true: 0,
  },
  // for native only, alternate family based on weight/style
  face: {
    // pass in weights as keys
    400: { normal: "OpenSans-Regular", italic: "OpenSans-Italic" },
    700: { normal: "OpenSans-Bold", italic: "OpenSans-BoldItalic" },
    normal: { normal: "OpenSans-Regular", italic: "OpenSans-Italic" },
    bold: { normal: "OpenSans-Bold", italic: "OpenSans-BoldItalic" },
  },
});
export const config = createTamagui({
  themes,
  tokens,
  fonts: {
    heading: OpenSansFont,
    body: OpenSansFont,
  },
});

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;