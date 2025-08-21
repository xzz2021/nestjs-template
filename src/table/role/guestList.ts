export const guestList = [
  {
    id: -5,
    parentId: null,
    path: '/dashboard',
    component: '#',
    redirect: '/dashboard/workplace',
    name: 'Dashboard',
    meta: {
      title: 'router.dashboard',
      icon: 'vi-ant-design:dashboard-filled',
      alwaysShow: true,
    },
  },
  {
    id: -6,
    parentId: -5,
    path: 'workplace',
    component: 'views/Dashboard/Workplace',
    name: 'Workplace',
    meta: {
      title: 'router.workplace',
      noCache: true,
      affix: true,
    },
  },
];
