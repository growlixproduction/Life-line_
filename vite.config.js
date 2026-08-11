import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    {
      name: 'admin-route-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const rawUrl = (req.url || '').split('?')[0].toLowerCase().replace(/\/$/, '');
          
          if (rawUrl === '/admin') {
            req.url = '/index.html#admin';
          } else if (rawUrl === '/login') {
            req.url = '/index.html#login';
          } else if (rawUrl === '/doctors') {
            req.url = '/doctors.html';
          } else if (rawUrl === '/about' || rawUrl === '/overview') {
            req.url = '/about.html';
          } else if (rawUrl === '/departments') {
            req.url = '/departments.html';
          } else if (rawUrl === '/facilities') {
            req.url = '/facilities.html';
          } else if (rawUrl === '/gallery') {
            req.url = '/gallery.html';
          } else if (rawUrl === '/contact') {
            req.url = '/contact.html';
          } else if (rawUrl === '/booking') {
            req.url = '/booking.html';
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        departments: resolve(__dirname, 'departments.html'),
        doctors: resolve(__dirname, 'doctors.html'),
        facilities: resolve(__dirname, 'facilities.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        contact: resolve(__dirname, 'contact.html'),
        booking: resolve(__dirname, 'booking.html'),
        cardiology: resolve(__dirname, 'department-cardiology.html'),
        orthopedics: resolve(__dirname, 'department-orthopedics.html'),
        neurology: resolve(__dirname, 'department-neurology.html'),
        pediatrics: resolve(__dirname, 'department-pediatrics.html'),
        gynecology: resolve(__dirname, 'department-gynecology.html'),
        surgery: resolve(__dirname, 'department-surgery.html'),
        urology: resolve(__dirname, 'department-urology.html'),
        radiology: resolve(__dirname, 'department-radiology.html'),
      },
    },
  },
});
