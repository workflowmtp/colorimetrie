'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Database, Settings, RefreshCw } from 'lucide-react';

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
    try {
      const response = await fetch('/api/test-db');
      const data = await response.json();
      
      if (!data.success) {
        setDbStatus(data);
      }
    } catch (error) {
      console.error('Error checking database:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Vérification de la base de données...</p>
        </div>
      </div>
    );
  }

  if (!dbStatus) {
    // Si pas d'erreur de base de données, rediriger vers login
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-red-500" />
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
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
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
              <Settings className="w-4 h-4" />
              Solution recommandée
            </h3>
            <p className="text-gray-300 text-sm bg-gray-700 p-3 rounded">
              {dbStatus.solution}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">État des variables</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`flex items-center gap-2 ${dbStatus.details.hasDBHost ? 'text-green-500' : 'text-red-500'}`}>
                <div className={`w-2 h-2 rounded-full ${dbStatus.details.hasDBHost ? 'bg-green-500' : 'bg-red-500'}`} />
                DB_HOST
              </div>
              <div className={`flex items-center gap-2 ${dbStatus.details.hasDBUser ? 'text-green-500' : 'text-red-500'}`}>
                <div className={`w-2 h-2 rounded-full ${dbStatus.details.hasDBUser ? 'bg-green-500' : 'bg-red-500'}`} />
                DB_USER
              </div>
              <div className={`flex items-center gap-2 ${dbStatus.details.hasDBName ? 'text-green-500' : 'text-red-500'}`}>
                <div className={`w-2 h-2 rounded-full ${dbStatus.details.hasDBName ? 'bg-green-500' : 'bg-red-500'}`} />
                DB_NAME
              </div>
              <div className={`flex items-center gap-2 ${dbStatus.details.hasDBPassword ? 'text-green-500' : 'text-red-500'}`}>
                <div className={`w-2 h-2 rounded-full ${dbStatus.details.hasDBPassword ? 'bg-green-500' : 'bg-red-500'}`} />
                DB_PASSWORD
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
            <RefreshCw className="w-4 h-4" />
            Réessayer
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
