import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// Common plugins and settings
const commonConfig = {
  plugins: [
    react(),
    dts({
      outDir: ['dist', 'dist/server', 'dist/react', 'dist/umd'],
    }),
  ],
};

// External dependencies for all builds
const externalDeps = ['react', 'react-dom', 'socket.io-client', 'eventemitter3', 'lucide-react'];

// Global variables for UMD and other browser-compatible builds
const outputGlobals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'socket.io-client': 'io',
  eventemitter3: 'EventEmitter3',
  'lucide-react': 'LucideReact',
};

// Build configurations
export default defineConfig(({ mode }) => {
  // Client-side library build (ES and CJS)
  if (mode === 'lib') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist',
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'GeminiLiveSDK',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
          external: externalDeps,
          output: {
            globals: outputGlobals,
          },
        },
      },
    };
  }

  // Server-side library build (ES and CJS with SSR)
  if (mode === 'lib-server') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/server',
        ssr: true,
        lib: {
          entry: resolve(__dirname, 'src/server/index.js'),
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
          external: externalDeps,
          output: [
            {
              format: 'es',
              entryFileNames: 'index.es.js',
              chunkFileNames: '[name].es.js',
            },
            {
              format: 'cjs',
              entryFileNames: 'index.cjs.js',
              chunkFileNames: '[name].cjs.js',
            },
          ],
        },
      },
    };
  }

  // React components build (ES and CJS)
  if (mode === 'lib-react') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/react',
        lib: {
          entry: resolve(__dirname, 'src/react/index.js'),
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'lucide-react'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'lucide-react': 'LucideReact',
            },
          },
        },
      },
    };
  }

  // UMD build for browser
  if (mode === 'lib-umd') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/umd',
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'GeminiLiveSDK',
          formats: ['umd'],
          fileName: () => 'index.umd.js',
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'lucide-react'],
          output: {
            globals: outputGlobals,
          },
        },
      },
    };
  }

  // Development mode
  return {
    ...commonConfig,
    build: {
      sourcemap: true,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});