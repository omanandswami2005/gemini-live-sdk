// vite.config.js
import { defineConfig } from "file:///C:/Users/omana/Desktop/NPM_Packages/gemini-live-sdk/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/omana/Desktop/NPM_Packages/gemini-live-sdk/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import dts from "file:///C:/Users/omana/Desktop/NPM_Packages/gemini-live-sdk/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\omana\\Desktop\\NPM_Packages\\gemini-live-sdk";
var vite_config_default = defineConfig(({ mode }) => {
  const commonConfig = {
    plugins: [
      react(),
      dts({
        insertTypesEntry: true
      })
    ]
  };
  if (mode === "lib") {
    return {
      ...commonConfig,
      build: {
        outDir: "dist",
        lib: {
          entry: resolve(__vite_injected_original_dirname, "src/index.js"),
          name: "GeminiLiveSDK",
          formats: ["es", "cjs"],
          fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
          external: ["react", "react-dom", "socket.io-client", "eventemitter3", "lucide-react"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
              "socket.io-client": "io",
              eventemitter3: "EventEmitter3",
              "lucide-react": "LucideReact"
            }
          }
        }
      }
    };
  }
  if (mode === "lib-server") {
    return {
      ...commonConfig,
      build: {
        outDir: "dist/server",
        ssr: true,
        lib: {
          entry: resolve(__vite_injected_original_dirname, "src/server/index.js"),
          formats: ["es", "cjs"],
          fileName: (format) => `index.${format}.js`
        }
      }
    };
  }
  if (mode === "lib-react") {
    return {
      ...commonConfig,
      build: {
        outDir: "dist/react",
        lib: {
          entry: resolve(__vite_injected_original_dirname, "src/react/index.js"),
          formats: ["es", "cjs"],
          fileName: (format) => `index.${format}.js`
        },
        rollupOptions: {
          external: ["react", "react-dom", "lucide-react"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
              eventemitter3: "EventEmitter3",
              "lucide-react": "LucideReact"
            }
          }
        }
      }
    };
  }
  if (mode === "lib-umd") {
    return {
      ...commonConfig,
      build: {
        outDir: "dist/umd",
        lib: {
          entry: resolve(__vite_injected_original_dirname, "src/index.js"),
          name: "GeminiLiveSDK",
          formats: ["umd"],
          fileName: () => "index.umd.js"
        },
        rollupOptions: {
          external: ["react", "react-dom", "lucide-react"],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
              "socket.io-client": "io",
              eventemitter3: "EventEmitter3",
              "lucide-react": "LucideReact"
            }
          }
        }
      }
    };
  }
  return {
    ...commonConfig,
    optimizeDeps: {
      exclude: ["lucide-react"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxvbWFuYVxcXFxEZXNrdG9wXFxcXE5QTV9QYWNrYWdlc1xcXFxnZW1pbmktbGl2ZS1zZGtcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXG9tYW5hXFxcXERlc2t0b3BcXFxcTlBNX1BhY2thZ2VzXFxcXGdlbWluaS1saXZlLXNka1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvb21hbmEvRGVza3RvcC9OUE1fUGFja2FnZXMvZ2VtaW5pLWxpdmUtc2RrL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGNvbW1vbkNvbmZpZyA9IHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICByZWFjdCgpLFxuICAgICAgZHRzKHsgXG4gICAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWVcbiAgICAgIH0pXG4gICAgXVxuICB9O1xuXG4gIC8vIE1haW4gY2xpZW50LXNpZGUgYnVpbGQgKEVTIGFuZCBDSlMpXG4gIGlmIChtb2RlID09PSAnbGliJykge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5jb21tb25Db25maWcsXG4gICAgICBidWlsZDoge1xuICAgICAgICBvdXREaXI6ICdkaXN0JyxcbiAgICAgICAgbGliOiB7XG4gICAgICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL2luZGV4LmpzJyksXG4gICAgICAgICAgbmFtZTogJ0dlbWluaUxpdmVTREsnLFxuICAgICAgICAgIGZvcm1hdHM6IFsnZXMnLCAnY2pzJ10sXG4gICAgICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdH0uanNgXG4gICAgICAgIH0sXG4gICAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgICBleHRlcm5hbDogWydyZWFjdCcsICdyZWFjdC1kb20nLCAnc29ja2V0LmlvLWNsaWVudCcsICdldmVudGVtaXR0ZXIzJywgJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgICByZWFjdDogJ1JlYWN0JyxcbiAgICAgICAgICAgICAgJ3JlYWN0LWRvbSc6ICdSZWFjdERPTScsXG4gICAgICAgICAgICAgICdzb2NrZXQuaW8tY2xpZW50JzogJ2lvJyxcbiAgICAgICAgICAgICAgZXZlbnRlbWl0dGVyMzogJ0V2ZW50RW1pdHRlcjMnLFxuICAgICAgICAgICAgICAnbHVjaWRlLXJlYWN0JzogJ0x1Y2lkZVJlYWN0J1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBTZXJ2ZXItc2lkZSBidWlsZCAoTm9kZS5qcylcbiAgaWYgKG1vZGUgPT09ICdsaWItc2VydmVyJykge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5jb21tb25Db25maWcsXG4gICAgICBidWlsZDoge1xuICAgICAgICBvdXREaXI6ICdkaXN0L3NlcnZlcicsXG4gICAgICAgIHNzcjogdHJ1ZSxcbiAgICAgICAgbGliOiB7XG4gICAgICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3NlcnZlci9pbmRleC5qcycpLFxuICAgICAgICAgIGZvcm1hdHM6IFsnZXMnLCAnY2pzJ10sXG4gICAgICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBpbmRleC4ke2Zvcm1hdH0uanNgXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIFJlYWN0IGNvbXBvbmVudHMgYnVpbGRcbiAgaWYgKG1vZGUgPT09ICdsaWItcmVhY3QnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmNvbW1vbkNvbmZpZyxcbiAgICAgIGJ1aWxkOiB7XG4gICAgICAgIG91dERpcjogJ2Rpc3QvcmVhY3QnLFxuICAgICAgICBsaWI6IHtcbiAgICAgICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcmVhY3QvaW5kZXguanMnKSxcbiAgICAgICAgICBmb3JtYXRzOiBbJ2VzJywgJ2NqcyddLFxuICAgICAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXR9LmpzYFxuICAgICAgICB9LFxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgICByZWFjdDogJ1JlYWN0JyxcbiAgICAgICAgICAgICAgJ3JlYWN0LWRvbSc6ICdSZWFjdERPTScsXG4gICAgICAgICAgICAgIGV2ZW50ZW1pdHRlcjM6ICdFdmVudEVtaXR0ZXIzJyxcbiAgICAgICAgICAgICAgJ2x1Y2lkZS1yZWFjdCc6ICdMdWNpZGVSZWFjdCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gVU1EIGJ1aWxkIGZvciBicm93c2VyXG4gIGlmIChtb2RlID09PSAnbGliLXVtZCcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uY29tbW9uQ29uZmlnLFxuICAgICAgYnVpbGQ6IHtcbiAgICAgICAgb3V0RGlyOiAnZGlzdC91bWQnLFxuICAgICAgICBsaWI6IHtcbiAgICAgICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXguanMnKSxcbiAgICAgICAgICBuYW1lOiAnR2VtaW5pTGl2ZVNESycsXG4gICAgICAgICAgZm9ybWF0czogWyd1bWQnXSxcbiAgICAgICAgICBmaWxlTmFtZTogKCkgPT4gJ2luZGV4LnVtZC5qcydcbiAgICAgICAgfSxcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgIGV4dGVybmFsOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsJ2x1Y2lkZS1yZWFjdCddLFxuICAgICAgICAgIG91dHB1dDoge1xuICAgICAgICAgICAgZ2xvYmFsczoge1xuICAgICAgICAgICAgICByZWFjdDogJ1JlYWN0JyxcbiAgICAgICAgICAgICAgJ3JlYWN0LWRvbSc6ICdSZWFjdERPTScsXG4gICAgICAgICAgICAgICdzb2NrZXQuaW8tY2xpZW50JzogJ2lvJyxcbiAgICAgICAgICAgICAgZXZlbnRlbWl0dGVyMzogJ0V2ZW50RW1pdHRlcjMnLFxuICAgICAgICAgICAgICAnbHVjaWRlLXJlYWN0JzogJ0x1Y2lkZVJlYWN0J1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBEZXZlbG9wbWVudCBtb2RlXG4gIHJldHVybiB7XG4gICAgLi4uY29tbW9uQ29uZmlnLFxuICAgIG9wdGltaXplRGVwczoge1xuICAgICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXVxuICAgIH0sXG4gIH07XG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQXVWLFNBQVMsb0JBQW9CO0FBQ3BYLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxTQUFTO0FBSGhCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUs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
