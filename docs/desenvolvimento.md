# Diário de desenvolvimento

## Seleção de carreira (CareerScene)

**O que foi feito**

- Nova cena `CareerScene` ("ESCOLHA SUA CARREIRA") com quatro cards em grade 2x2:
  guitarrista, cantor, baterista e baixista. Cada card mostra o personagem em pixel art,
  o nome da carreira, o instrumento e uma descrição curta.
- Card selecionado: borda e brilho pulsante na cor da carreira, fundo mais claro e personagem
  "respirando". Os demais ficam escurecidos.
- Interação: clique no card seleciona; setas (ou WASD) navegam pela grade; Enter confirma;
  ESC volta ao menu. Botões CONFIRMAR e VOLTAR com o mesmo efeito do teclado.
  Ao voltar para a tela, a carreira já escolhida vem marcada.
- Fluxo: `MenuScene` (NOVO JOGO) → `CareerScene` → `GarageScene`.
- A carreira escolhida é gravada no `registry` do Phaser por `CareerSystem` (`setCareer`/`getCareer`).
  A garagem provisória mostra o personagem e "CARREIRA: <nome>" para comprovar que o dado chegou.
- Personagens PROVISÓRIOS de 32x32, desenhados por código (`src/ui/pixelArt.js` +
  `src/ui/characters.js`), sem imagens externas. Para usar arte original, basta carregar uma
  imagem com a chave `character-<id>` (ver `characterTextureKey`) e remover a função de desenho.

**Organização**

- `src/data/careers.js` dados das carreiras (id, nome, instrumento, descrição, cor).
- `src/systems/CareerSystem.js` guarda e lê a carreira escolhida.
- `src/ui/CareerCard.js`, `src/ui/PixelButton.js` componentes novos.
- `src/ui/transitions.js` `fadeToScene`, que substitui o código de fade que estava repetido
  em `MenuScene` e `GarageScene`.

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
