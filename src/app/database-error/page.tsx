'use client';

import { useEffect, useState } from 'react';

interface DatabaseError {
  success: false;
  error: string;
  errorType: string;
  solution: string;
  details: {
    hasDBHost: boolean;
    hasDBUser: boolean;
    hasDBName: boolean;
    hasDBPassword: boolean;
  };
  nextSteps: string[];
}

export default function DatabaseErrorPage() {
  const [dbStatus, setDbStatus] = useState<DatabaseError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      if (!data.success) {
        setDbStatus(data);
      } else {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error checking database:', error);
      setDbStatus({
        success: false,
        error: 'Impossible de contacter le serveur',
        errorType: 'network',
        solution: 'Vérifiez votre connexion internet et réessayez',
        details: { hasDBHost: false, hasDBUser: false, hasDBName: false, hasDBPassword: false },
        nextSteps: ['Vérifiez votre connexion', 'Réessayez dans quelques instants'],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Vérification de la base de données...</p>
        </div>
      </div>
    );
  }

  if (!dbStatus) return null;

  const Dot = ({ ok }: { ok: boolean }) => (
    <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🗄️
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Base de données inaccessible
          </h1>
          <p className="text-gray-400">
            ColorLab Pro ne peut pas se connecter à la base de données
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <div>
              <h3 className="text-red-500 font-semibold mb-1">
                Erreur : {dbStatus.errorType}
              </h3>
              <p className="text-gray-300 text-sm">{dbStatus.error}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              ⚙️ Solution recommandée
            </h3>
            <p className="text-gray-300 text-sm bg-gray-700 p-3 rounded">
              {dbStatus.solution}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">État des variables</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`flex items-center gap-2 ${dbStatus.details.hasDBHost ? 'text-green-500' : 'text-red-500'}`}>
                <Dot ok={dbStatus.details.hasDBHost} /> DB_HOST
              </div>
              <div className={`flex items-center gap-2 ${dbStatus.details.hasDBUser ? 'text-green-500' : 'text-red-500'}`}>
                <Dot ok={dbStatus.details.hasDBUser} /> DB_USER
              </div>
              <div className={`flex items-center gap-2 ${dbStatus.details.hasDBName ? 'text-green-500' : 'text-red-500'}`}>
                <Dot ok={dbStatus.details.hasDBName} /> DB_NAME
              </div>
              <div className={`flex items-center gap-2 ${dbStatus.details.hasDBPassword ? 'text-green-500' : 'text-red-500'}`}>
                <Dot ok={dbStatus.details.hasDBPassword} /> DB_PASSWORD
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">Actions à effectuer</h3>
            <ol className="space-y-1 text-sm text-gray-300">
              {dbStatus.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 font-semibold">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={checkDatabase}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            🔄 Réessayer
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Ignorer et continuer
          </button>
        </div>
      </div>
    </div>
  );
}
