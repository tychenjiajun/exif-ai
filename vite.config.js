import { defineConfig } from "vitest/config";

const RemoveShebangPlugin = () => {
  return {
    name: "vitest:remove-shebang-plugin",
    enforce: "pre",
    transform(code) {
      return code.replace(/^\#\!.*/, "");
    },
  };
};
export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "istanbul", // or 'v8'
    },
    environment: "node", // Since we're running Node.js-specific code
  },
  plugins: [RemoveShebangPlugin()],
});
