export { darkTheme } from "./dark";
export { lightTheme } from "./light";
export { plan9Theme } from "./plan9";
export { palenightTheme } from "./palenight";

import { darkTheme } from "./dark";
import { lightTheme } from "./light";
import { plan9Theme } from "./plan9";
import { palenightTheme } from "./palenight";
import type { Theme, BuiltinThemeId } from "../types";

/** Map of all built-in themes by ID */
export const builtinThemes: Record<BuiltinThemeId, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  plan9: plan9Theme,
  palenight: palenightTheme,
};

/** Array of all built-in themes for iteration */
export const builtinThemeList: Theme[] = [
  darkTheme,
  lightTheme,
  plan9Theme,
  palenightTheme,
];

/** Get a built-in theme by ID */
export function getBuiltinTheme(id: BuiltinThemeId): Theme {
  return builtinThemes[id];
}
