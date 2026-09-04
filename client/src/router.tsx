import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { RequireAuth } from './features/auth/index.ts'
import DashboardPage from './pages/DashboardPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import ReportsPage from './pages/ReportsPage.tsx'
import RequestsPage from './pages/RequestsPage.tsx'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'requests',
            element: <RequestsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
], { basename })
