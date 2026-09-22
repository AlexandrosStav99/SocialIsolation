import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  forbidOnly: !!process.env.CI,
  retries: 0,
  use: { browserName: "chromium", baseURL: "http://127.0.0.1:3100" },
  webServer: [
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100",
      env: { TALKPOINT_ENABLE_DEMO_DASHBOARD: "false" },
      reuseExistingServer: false,
    },
    {
      command: "npm run start -- --hostname 127.0.0.1 --port 3101",
      url: "http://127.0.0.1:3101",
      env: { TALKPOINT_ENABLE_DEMO_DASHBOARD: "true" },
      reuseExistingServer: false,
    },
  ],
});
