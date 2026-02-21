import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: "CodeStreet: The Feature Futures Exchange",
        short_name: "CodeStreet",
        description: "The first Crowdfunded Roadmap Platform. Invest in features you want to see built.",
        id: "codestreet-ventures-app",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#111827",
        theme_color: "#10B981",
        categories: ["finance", "productivity", "business"],
        icons: [
          {
            src: "/vite.svg",
            type: "image/svg+xml",
            sizes: "192x192"
          },
          {
            src: "/vite.svg",
            type: "image/svg+xml",
            sizes: "512x512"
          }
        ],
        shortcuts: [
          {
            name: "My Portfolio",
            short_name: "Portfolio",
            description: "View your feature equity holdings",
            url: "/portfolio",
            icons: [{ "src": "/vite.svg", "sizes": "192x192" }]
          },
          {
            name: "Market Board",
            short_name: "Board",
            description: "View live feature listings",
            url: "/",
            icons: [{ "src": "/vite.svg", "sizes": "192x192" }]
          },
          {
            name: "Executive Wealth",
            short_name: "Wealth",
            description: "Admin Wealth Dashboard",
            url: "/admin/wealth",
            icons: [{ "src": "/vite.svg", "sizes": "192x192" }]
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
