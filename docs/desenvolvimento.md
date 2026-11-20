# Diário de desenvolvimento

## Tela inicial (MenuScene)

**O que foi feito**

- Resolução do jogo definida em 960x540 (16:9) com `Scale.FIT` (escala responsiva).
- Fonte Press Start 2P pelo Google Fonts; sem internet, o jogo usa `Courier New`/monoespaçada
  (`FONT_FAMILY` em `src/config/constants.js`). O `main.js` espera a fonte por até 2,5 s antes de iniciar.
- `MenuScene`: céu noturno em faixas, estrelas piscando, holofotes, palco em silhueta,
  notas coloridas caindo nas laterais, título animado e menu (Novo Jogo, Continuar, Opções).
  Navegação por teclado (↑/↓ ou W/S, Enter/Espaço) e mouse (hover e clique).
  "Continuar" e "Opções" aparecem desativados ("EM BREVE").
- `GarageScene`: tela provisória só para testar a transição (fade) entre cenas.
  Volta ao menu com ESC, Enter ou clicando em "VOLTAR".
- Todo o visual é desenhado por código (formas do Phaser), sem imagens externas.

**Organização**

- `src/config/` constantes (resolução, fonte, paleta, chaves de cena, profundidades).
- `src/scenes/` cenas (telas).
- `src/ui/` componentes visuais reutilizáveis (cenário, notas caindo, lista de menu).

**Próximos passos**

- Escolha de carreira (cantor, guitarrista, baterista, baixista) na garagem.
- Cena de jogo rítmico (`GameScene`) e sistemas de pontuação e carreira.
