import { defineConfig } from 'umi';

import routes from "./src/config/routes";
import theme from "./src/config/theme";
export default defineConfig({
  routes,
  theme,
  title:"AuFs",
  history: {type: "hash"},
  antd: {},
  dva: {
    immer: true,
    hmr: false,
  },
  nodeModulesTransform: {type:'none'},
  fastRefresh: {},
  ignoreMomentLocale: true,
  webpack5: {},
  locale: {
    default: "zh-CN",
    antd: true,
    title: true,
    baseNavigator: true,
    baseSeparator: "-",
  },
  targets: {
    ie: 11,
  },
});
