# Portfólio Anderson Jr.

Site estático profissional em HTML, CSS e JavaScript vanilla.

## Estrutura

- `index.html` — página única com todas as seções
- `styles.css` — estilos globais e tokens de design
- `scripts/main.js` — navegação, projetos, modal, formulário e animações
- `data/projects.json` — dados dos projetos exibidos no portfólio
- `images/` — fotos e capturas de tela
- `package.json` — scripts de otimização de imagens e Lighthouse

## Desenvolvimento local

```bash
npm start
```

Abra `http://localhost:8000` no navegador.

## Otimizar imagens

```bash
npm install
npm run optimize-images
```

## Deploy

Compatível com hospedagem estática (ex.: Netlify). O formulário de contato usa Netlify Forms (`data-netlify="true"`).
