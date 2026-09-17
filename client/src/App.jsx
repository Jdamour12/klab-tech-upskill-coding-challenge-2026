import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/AuthForm';
import TaskManager from './components/TaskManager';

function Gate() {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) {
    return <div className="min-h-screen bg-surface" />;
  }

  return isAuthenticated ? <TaskManager /> : <AuthForm />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
