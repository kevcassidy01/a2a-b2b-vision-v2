import brewPeach from "../../assets/a2a/products/brew-peach-iced-tea.jpg";
import cherry from "../../assets/a2a/products/fizz-cherry-concentrate.jpg";
import cola from "../../assets/a2a/products/fizz-cola-syrup.jpg";
import lime from "../../assets/a2a/products/fizz-lime-concentrate.jpg";
import original from "../../assets/a2a/products/fizz-original-concentrate.jpg";
import vanilla from "../../assets/a2a/products/fizz-vanilla-concentrate.jpg";
import zero from "../../assets/a2a/products/fizz-zero-concentrate.jpg";
import lemonade from "../../assets/a2a/products/pulp-lemonade-concentrate.jpg";
import orange from "../../assets/a2a/products/pulp-orange-concentrate.jpg";
import zingMango from "../../assets/a2a/products/zing-energy-mango.jpg";

/**
 * Product photos (Somnath's), on white, so they sit on a light tint of their
 * packaging with `mix-blend-mode: multiply`: the white takes the tint. Visuals,
 * not copy.
 */
export type Photo = { src: string; tint: string };

export const PHOTOS = {
  original: { src: original, tint: "#fbe4e4" },
  zero: { src: zero, tint: "#ededef" },
  cherry: { src: cherry, tint: "#f8e3e8" },
  vanilla: { src: vanilla, tint: "#f7f0e2" },
  lime: { src: lime, tint: "#eef6dc" },
  lemonade: { src: lemonade, tint: "#fdf5cf" },
  orange: { src: orange, tint: "#fde8d4" },
  zingMango: { src: zingMango, tint: "#fdf3d0" },
  brewPeach: { src: brewPeach, tint: "#fde7dd" },
  colaSyrup: { src: cola, tint: "#f6e9e9" },
} satisfies Record<string, Photo>;
