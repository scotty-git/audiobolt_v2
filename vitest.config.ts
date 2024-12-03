/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [
            './src/__tests__/setup-dom.ts',
            './src/__tests__/setup.ts'
        ],
        include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/__tests__/setup.ts',
                'src/__tests__/setup-dom.ts',
                'src/vite-env.d.ts',
                'src/**/*.d.ts',
            ],
        },
        testTimeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 10000,
    },
});