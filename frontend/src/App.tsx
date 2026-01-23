import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './hooks/useStore';
import { api } from './services/api';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Ranking from './pages/Ranking';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Game from './game/Game';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function UserDataSync() {
  const { token, setUser } = useStore();
  
  useEffect(() => {
    if (token) {
      api.auth.me()
        .then((data: any) => setUser(data.user || data))
        .catch(() => {});
    }
  }, [token, setUser]);
  
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <UserDataSync />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <Game />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
