module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
          },
        },
      ],
      // skip worklets plugin on web/Netlify — reanimated v4 web uses CSS, not worklets
      ...(process.env.NETLIFY ? [] : ["react-native-reanimated/plugin"]),
    ],
  };
};
