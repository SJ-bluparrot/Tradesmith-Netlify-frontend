export const colors = {
  primary: "#8d4b00",
  onPrimary: "#ffffff",
  primaryContainer: "#b15f00",
  onPrimaryContainer: "#fffbff",
  inversePrimary: "#ffb77d",
  primaryFixed: "#ffdcc3",
  primaryFixedDim: "#ffb77d",
  onPrimaryFixed: "#2f1500",

  secondary: "#515f74",
  onSecondary: "#ffffff",
  secondaryContainer: "#d5e3fd",
  onSecondaryContainer: "#57657b",

  tertiary: "#006096",
  onTertiary: "#ffffff",

  background: "#fff8f5",
  onBackground: "#231a13",

  surface: "#fff8f5",
  onSurface: "#231a13",
  surfaceVariant: "#f2dfd3",
  onSurfaceVariant: "#554336",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#fff1e9",
  surfaceContainer: "#fdeade",
  surfaceContainerHigh: "#f7e5d9",
  surfaceContainerHighest: "#f2dfd3",
  surfaceBright: "#fff8f5",
  surfaceDim: "#e9d7cb",

  inverseSurface: "#392e26",
  inverseOnSurface: "#ffede3",

  outline: "#887364",
  outlineVariant: "#dbc2b0",

  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
} as const;

export type ColorKey = keyof typeof colors;
