const mapRoutes = [
    {
        path: '/',
        redirect: '/map'
    },
    {
        path: '/map',
        name: 'MapView',
        //@ts-ignore
        component: () => import('./views/MapView.vue'),
    },
];

export default mapRoutes;