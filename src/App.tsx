import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AppLauncher } from './pages/AppLauncher';
import { CreateUser } from './pages/CreateUser';
import { Logs } from './pages/Logs';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!session ? <MainLayout><Login /></MainLayout> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!session ? <MainLayout><Register /></MainLayout> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/dashboard"
          element={session ? <MainLayout><Dashboard /></MainLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/create-user"
          element={session ? <MainLayout><CreateUser /></MainLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/logs"
          element={session ? <MainLayout><Logs /></MainLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/app/:id"
          element={session ? <MainLayout><AppLauncher /></MainLayout> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
