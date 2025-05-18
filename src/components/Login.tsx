import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // supabase client para invocar la función
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore'; // <--- IMPORTAR useStore

// Idealmente, este tipo vendría de un archivo de tipos compartido
interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string | number;
    userName: string;
  };
}

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const zustandLoginAction = useStore((state) => state.login); // <--- OBTENER LA ACCIÓN LOGIN

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: functionError } = await supabase.functions.invoke<AuthResponse>(
        'autenticar-usuario', // Nombre de tu Edge Function
        {
          body: { userName, password },
        }
      );

      if (functionError) {
        console.error('Error al invocar la función:', functionError);
        // Intentar obtener un mensaje de error más específico si la función lo devuelve en data
        const errMsg = (functionError as any).context?.data?.error || functionError.message || 'Error de autenticación.';
        setError(errMsg);
        throw new Error(errMsg);
      }

      if (data) {
        // Autenticación exitosa
        console.log('Login.tsx: Token recibido:', data.token);
        console.log('Login.tsx: Usuario recibido:', data.user);

        try {
          // YA NO NECESITAS GUARDAR EN LOCALSTORAGE AQUÍ, ZUSTAND LO HARÁ
          // localStorage.setItem('authToken', data.token);
          // console.log('Login.tsx: Token guardado en localStorage.');
          // localStorage.setItem('userData', JSON.stringify(data.user));
          // console.log('Login.tsx: userData guardado en localStorage.');

          // LLAMAR A LA ACCIÓN LOGIN DE ZUSTAND
          zustandLoginAction(data.user, data.token); // <--- USAR LA ACCIÓN

          console.log("Login.tsx: Intentando redirigir a '/'...");
          navigate('/');
          console.log("Login.tsx: Redirección a '/' solicitada.");

        } catch (storeOrNavError) {
          console.error("Login.tsx: Error durante la actualización del store o la navegación:", storeOrNavError);
          setError("Error al procesar el login localmente.");
        }
         
      } else {
        console.error('Login.tsx: Token o usuario no recibido en la respuesta, aunque no hubo functionError.');
        // Esto no debería ocurrir si functionError no se disparó, pero por si acaso
        setError('Respuesta inesperada del servidor.');
      }

    } catch (err: unknown) {
      // El error ya debería estar seteado por el bloque 'if (functionError)'
      // pero por si acaso hay otro tipo de error.
      if (!error && err instanceof Error) {
        setError(err.message);
      } else if (!error) {
        setError('Un error inesperado ocurrió durante el login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Golf Cart Inspection Login</h2>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <form onSubmit={handleLogin} className="mt-4">
          <div className="mb-4">
            <label htmlFor="userName" className="block text-gray-700 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="userName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your username"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
