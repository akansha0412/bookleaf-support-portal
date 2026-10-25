
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from './features/auth/LoginPage';
import { useAuth } from './features/auth/useAuth';
import { AdminDashboard } from './features/tickets/AdminDashboard';
import { AuthorDashboard } from './features/author/AuthorDashboard';

function App() {
  const { auth, checkingAuth, login, logout } = useAuth();

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">
          Checking your session…
        </div>
      </div>
    );
  }

  const homePath =
    auth?.user.role === 'ADMIN'
      ? '/admin'
      : auth?.user.role === 'AUTHOR'
        ? '/author'
        : '/login';

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            auth ? (
              <Navigate to={homePath} replace />
            ) : (
              <LoginPage onLogin={login} />
            )
          }
        />

        <Route
          path="/admin"
          element={
            auth?.user.role === 'ADMIN' ? (
              <AdminDashboard auth={auth} onLogout={logout} />
            ) : (
              <Navigate to={homePath} replace />
            )
          }
        />

        <Route
          path="/author"
          element={
            auth?.user.role === 'AUTHOR' ? (
              <AuthorDashboard auth={auth} onLogout={logout} />
            ) : (
              <Navigate to={homePath} replace />
            )
          }
        />

        <Route
          path="*"
          element={<Navigate to={homePath} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;