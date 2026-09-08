import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', fullyParallel: false, reporter: 'list', use: { baseURL: 'http://127.0.0.1:5192', headless: true }, webServer: { command: 'npm run dev -- --port 5192 --strictPort', url: 'http://127.0.0.1:5192', reuseExistingServer: false } });
