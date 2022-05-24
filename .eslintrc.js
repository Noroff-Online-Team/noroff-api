module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ["prettier", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "linebreak-style": [
      "error",
      process.platform === "win32" ? "windows" : "unix"
    ]
  }
}
