module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ["prettier", "eslint:recommended", "plugin:@typescript-eslint/recommended-type-checked"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    "linebreak-style": ["error", process.platform === "win32" ? "windows" : "unix"]
  }
}
