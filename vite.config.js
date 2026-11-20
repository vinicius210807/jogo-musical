import { defineConfig } from 'vite';

// O GitHub Pages publica o jogo em https://vinicius210807.github.io/jogo-musical/,
// então o build (e o `npm run preview`, que serve o build) usa esse caminho base.
// No desenvolvimento (`npm run dev`) o jogo continua em http://localhost:5173/, sem prefixo.
export default defineConfig(({ command, isPreview }) => ({
    base: command === 'serve' && !isPreview ? '/' : '/jogo-musical/'
}));
