import React, { useState } from 'react';
import { authService } from '../services/authService';
import styles from './LoginRegister.module.css';

interface LoginRegisterProps {
  onLoginSuccess: () => void;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isLogin) {
        await authService.signIn({
          email,
          password,
        });
        setSuccess('Sesión iniciada correctamente');
        setTimeout(onLoginSuccess, 1500);
      } else {
        await authService.signUp({
          email,
          password,
          displayName,
        });
        setSuccess('Cuenta creada correctamente. Por favor revisa tu email para confirmar.');
        setEmail('');
        setPassword('');
        setDisplayName('');
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    const guestProfile = {
      username: 'Invitado',
      income: 0,
      frequency: 'MONTHLY',
      currency: 'USD',
      streak: 0,
      xp: 0,
      lives: 5,
      completedLessons: [],
      lastLoginDate: new Date().toISOString(),
      lastStreakDate: undefined,
    } as any;

    localStorage.setItem('finanza_profile', JSON.stringify(guestProfile));
    // Marca que el usuario es invitado para posibles condicionales
    localStorage.setItem('finanza_guest', 'true');
    onLoginSuccess();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h1>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label htmlFor="displayName">Nombre</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                disabled={loading}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading
              ? 'Procesando...'
              : isLogin
              ? 'Iniciar Sesión'
              : 'Crear Cuenta'}
          </button>
        </form>

        <div className={styles.toggle}>
          {isLogin ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={styles.toggleButton}
              >
                Regístrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={styles.toggleButton}
              >
                Inicia sesión aquí
              </button>
            </>
          )}
        </div>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button
            type="button"
            onClick={continueAsGuest}
            className={styles.toggleButton}
            aria-label="Entrar sin cuenta"
          >
            Entrar sin cuenta
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
