import { defineConfig } from 'vite'
import reactSwc from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactSwc()],
})
