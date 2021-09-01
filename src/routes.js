import Conference from "./pages/Conference"
import Auth from "./pages/Auth"
import Home from "./pages/Home"


export const authRoutes = [
    {
        path: '/conference/:room',
        Component: Conference
    },
    {
        path: '/home',
        Component: Home
    }
]

export const publicRoutes = [
    {
        path: '/signup',
        Component: Auth
    },
    {
        path: '/login',
        Component: Auth
    }
]

