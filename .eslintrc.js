var config = {
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  },
  "extends": ["openlayers", "plugin:prettier/recommended"],
  "rules": {
    "object-curly-spacing": "off",
    "no-var": "off",
    "no-console": (process.env.WATCH) ? "off" : ["error", { allow: ["info", "warn", "error"] }],
    "no-debugger": (process.env.WATCH) ? "off" : "error"
  }
};
module.exports = config;
