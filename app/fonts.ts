import { Outfit, Atkinson_Hyperlegible } from "next/font/google";

export const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["100", "200", "300", "400", "500", "700", "800", "900"],
  display: "swap",
});

export const atkins = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
