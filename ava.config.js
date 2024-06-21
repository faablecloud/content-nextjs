require("dotenv/config");
module.exports = {
  files: ["src/**/*.test.ts"],
  environmentVariables: {
    ...process.env,
  },
  typescript: {
    extensions: ["ts", "tsx"],
    rewritePaths: {
      "src/": "dist/",
    },
    compile: "tsc",
  },
};
