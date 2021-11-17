import { defineConfig } from 'umi';

import routes from './src/config/routes';
import theme from './src/config/theme';

export default defineConfig({
  routes,
  theme,
  links: [
    {
      rel: 'icon',
      href: './logo.ico',
    },
  ],
  title: 'AuFs Dashboard',
  history: { type: 'hash' },
  antd: {},
  dva: {
    immer: true,
    hmr: false,
  },
  nodeModulesTransform: { type: 'none' },
  fastRefresh: {},
  ignoreMomentLocale: true,
  webpack5: {},
  targets: {
    ie: 11,
  },
  dynamicImport: {},
  publicPath: './',
  mfsu: {},
});
