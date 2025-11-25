import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/renderer/components'),
            '@pages': path.resolve(__dirname, './src/renderer/pages'),
            '@services': path.resolve(__dirname, './src/renderer/services'),
            '@hooks': path.resolve(__dirname, './src/renderer/hooks'),
            '@types': path.resolve(__dirname, './src/shared/types'),
        },
    },
    base: './',
    build: {
        outDir: 'dist',
    },
    server: {
        port: 3000,
        strictPort: true,
    },
})
