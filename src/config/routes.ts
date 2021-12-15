const router = [
  {
    path: '/video/:path',
    component: '@/pages/video/',
  },
  {
    path: '/',
    component: '@/layouts',
    routes: [
      {
        path: '/',
        component: '@/pages/info',
      },
      {
        path: '/files',
        component: '@/pages/files',
      },
      {
        path: '/peers',
        component: '@/pages/peers',
      },
      {
        path: '/accounting',
        component: '@/pages/accounting',
      },
      {
        path: '/setting',
        component: '@/pages/setting',
      },
      {
        path: '/log',
        component: '@/pages/log',
      },
      {
        path: '/*',
        component: '@/pages/404',
      },
    ],
  },
];
export default router;
