const mapRoutes = [
    {
        path: '/',
        name: 'LandingPage',
        //@ts-ignore
        component: () => import('@/views/LandingPage.vue'),
    },
    {
        path: '/map',
        name: 'MapView',
        //@ts-ignore
        component: () => import('./views/MapView.vue'),
    },
];

export default mapRoutes;