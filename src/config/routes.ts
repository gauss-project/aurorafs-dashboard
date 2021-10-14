const router =  [
  {
    path: "/video",
    component: "@/pages/video"
  },
  {
    path: '/',
    component: '@/layouts',
    routes:[
      {
        path:"/",
        component: '@/pages/info',
      },
      {
        path:"/files",
        component: '@/pages/files',
      },
      {
        path:"/peers",
        component: '@/pages/peers',
      },
      {
        path:"/setting",
        component: '@/pages/setting',
      },
      {
        path: '/*',
        component: '@/pages/404'
      }
    ]
  }
]

export default router
