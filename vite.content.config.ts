import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.ts')
      },
      output: {
        entryFileNames: 'content.js',
        assetFileNames: '[name].[ext]',
        format: 'iife',
        inlineDynamicImports: true
      }
    }
  }
});
