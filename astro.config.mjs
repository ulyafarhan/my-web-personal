import { defineConfig, passthroughImageService } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import vue from '@astrojs/vue';
import tailwindv4 from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  image: {
    service: passthroughImageService(),
  },
  integrations: [
    vue()
  ],
  vite: {
    plugins: [tailwindv4()],
    ssr: {
      external: ['node:crypto', 'crypto', 'bcryptjs', 'node:async_hooks', 'async_hooks']
    }
  }
});
