import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('./', import.meta.url));
const srcDir = fileURLToPath(new URL('./src', import.meta.url));

const clientSecretNamePattern = /(SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY|CLIENT_SECRET)/i;
const clientSecretValuePatterns = [
  /^sk-[A-Za-z0-9]+/,
  /^AIza[0-9A-Za-z\-_]{35}$/,
  /^gh[pousr]_/,
  /^github_pat_/,
  /^AKIA[0-9A-Z]{16}$/,
  /^xox[baprs]-/,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----/,
];

function validateClientEnv(mode) {
  const env = loadEnv(mode, rootDir, '');
  const suspiciousClientVars = Object.entries(env).filter(([key, value]) => {
    if (!key.startsWith('VITE_')) {
      return false;
    }

    return (
      clientSecretNamePattern.test(key) ||
      clientSecretValuePatterns.some((pattern) => pattern.test(value))
    );
  });

  if (suspiciousClientVars.length > 0) {
    const names = suspiciousClientVars.map(([key]) => key).join(', ');

    throw new Error(
      `Unsafe client environment variables detected: ${names}. ` +
      'Vite exposes every VITE_* variable to browser users. Move secrets to the backend and keep only public values in frontend env files.'
    );
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  validateClientEnv(mode);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
  };
})
