import ModuleData from './module.json' with { type: 'json' };
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import postcss from 'postcss';
import * as path from 'path';

const ModuleConfig = {
  IncludeSourceMaps: true,
  CompressFiles: false,
  RemoveConsoleLogs: false,
  RemoveDebugger: true,

  PackageType: 'modules', // modules | systems | etc.
  
  Server: {
    Port: 30001
  },

  Output: {
    Directory: 'dist',
    Empty: true,
  },

  Module: {
      Development: ModuleData.esmodules[0].replace('/dist', ''), // src + Path to main module file.
      Release: ModuleData.esmodules[0].replace('/dist', '') // Output.Directory + Path to main module file.
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/',                 // Source location / esbuild root.
  base: `/${ModuleData.id}/`,    // Base module path that 30001 / served dev directory.
  publicDir: false,             // No public resources to copy.
  cacheDir: '../.vite-cache',   // Relative from root directory.

  resolve: {
    conditions: ['import', 'browser'],
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@Module': path.resolve(__dirname, 'src/assets/scripts/libs/module.mjs'),
      '@settings': path.resolve(__dirname, 'src/assets/scripts/libs/settings.mjs'),
      '@logger': path.resolve(__dirname, 'src/assets/scripts/libs/logger.mjs'),
    }
  },

  esbuild: {
    target: ['es2022']
  },

  css: {
    // Creates a standard configuration for PostCSS with autoprefixer & postcss-preset-env.
    //postcss: postcssConfig({ compress: ModuleConfig.CompressFiles, sourceMap: ModuleConfig.IncludeSourceMaps })
  },

  define: {
    'process.env': {}
  },

  server: {
    port: ModuleConfig.Server.Port,
    open: '/game',
    proxy: {
      // Serves static files from main Foundry server.
      [`^(/${ModuleData.id}/(images|assets|lang|packs|style.css))`]: 'http://localhost:30000',

      // All other paths besides package ID path are served from main Foundry server.
      [`^(?!/${ModuleData.id}/)`]: 'http://localhost:30000',

      // Enable socket.io from main Foundry server.
      '/socket.io': { target: 'ws://localhost:30000', ws: true }
    }
  },
  build: {
    outDir: __dirname + '/dist',
    emptyOutDir: ModuleConfig.Output.Empty,
    sourcemap: ModuleConfig.IncludeSourceMaps,
    //brotliSize: true,
    minify: ModuleConfig.CompressFiles ? 'terser' : false,
    target: ['es2022'],
    terserOptions: ModuleConfig.CompressFiles ? { ...terserConfig(), ecma: 2022 } : void 0,
    lib: {
      entry: './assets/scripts/init.mjs',
      formats: ['es'],
      fileName: (format) => `${ModuleConfig.Module.Release.replace(/^(\/|\.\/*)/, '')}`,
    },
    rollupOptions: {
      plugins: [
        ...ModuleConfig.CompressFiles ? [terser({
          compress: {
            drop_console: ModuleConfig.RemoveConsoleLogs,  // Removes console logs
            drop_debugger: ModuleConfig.RemoveDebugger,    // Removes debugger statements
          }
        })] : []
      ],
      output: {
        // Adjust the pattern for asset files
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css' && assetInfo.type === 'asset' && assetInfo.source) {
            return 'assets/styles/module.css';
          }
          // For other assets, keep the default naming
          return 'assets/[name].[ext]';
        }
      }
    }
  },
  // Necessary when using the dev server for top-level await usage inside of TRL.
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022'
    }
  },
  plugins: [
    vue(),
    postcss()
  ],
})