// File: static/vue/router.js

import home from "./components/home.js";
import about from "./components/about.js";
import UserLogin from "./components/userlogin.js";
import UserRegister from "./components/UserRegister.js";
import userhome from "./components/userhome.js";

const routes = [
    {
        path: "/",
        component: home,
        name: "home"
    },
    {
        path: "/about",
        component: about,
        name: "about"
    },
    {
        path: '/userlogin',
        component: UserLogin,
        name: 'UserLogin'
    },
    {
        path: '/user-register',
        component: UserRegister,
        name: 'UserRegister'
    },
    {
        path: '/userhome',
        component: userhome,
        name: 'Userhome',
        meta: { requiresAuth: true }
    },
    {
        path: "*",
        redirect: "/"
    }
];

const router = new VueRouter({
    routes
});

// Navigation guard to check for authentication
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!localStorage.getItem('token')) {
            next({
                path: '/userlogin',
                query: { redirect: to.fullPath }
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;