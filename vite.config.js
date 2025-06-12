import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const commonConfig = {
    plugins: [
      react(),
      dts({ 
        insertTypesEntry: true
      })
    ]
  };

  // Main client-side build (ES and CJS)
  if (mode === 'lib') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist',
        lib: {
          entry: resolve(__dirname, 'src/index.js'),
          name: 'GeminiLiveSDK',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'socket.io-client', 'eventemitter3', 'lucide-react'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'socket.io-client': 'io',
              eventemitter3: 'EventEmitter3',
              'lucide-react': 'LucideReact'
            }
          }
        }
      }
    };
  }

  // Server-side build (Node.js)
  if (mode === 'lib-server') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/server',
        ssr: true,
        lib: {
          entry: resolve(__dirname, 'src/server/index.js'),
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format}.js`
        },
      }
    };
  }

  // React components build
  if (mode === 'lib-react') {
    return {
      ...commonConfig,
      build: {
        outDir: 'dist/react',
        lib: {
          entry: resolve(__dirname, 'src/react/index.js'),
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'lucide-react'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              eventemitter3: 'EventEmitter3',
              'lucide-react': 'LucideReact'
            }
          }
        }
      }
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
          fileName: () => 'index.umd.js'
        },
        rollupOptions: {
          external: ['react', 'react-dom','lucide-react'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'socket.io-client': 'io',
              eventemitter3: 'EventEmitter3',
              'lucide-react': 'LucideReact'
            }
          }
        }
      }
    };
  }

  // Development mode
  return {
    ...commonConfig,
    optimizeDeps: {
      exclude: ['lucide-react']
    },
  };
});