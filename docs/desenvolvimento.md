# Diário de desenvolvimento

## Garagem como ambiente principal (GarageScene)

**O que foi feito**

- A garagem provisória virou um ambiente de gerenciamento: cenário de garagem improvisada
  (parede de tijolos, piso de madeira, porta de enrolar suspensa com a noite lá fora,
  bandeirinhas, pôsteres, amplificadores, caixas de papelão, monitor de palco e tapete surrado),
  com lâmpada pelada balançando, poeira na luz e LED do amplificador piscando.
- O músico da carreira escolhida aparece sobre o tapete (mesma textura da `CareerScene`, em
  escala 5x, já com o instrumento no sprite), com uma plaquinha com o nome e o instrumento.
- HUD no topo: botão "< MENU", título e contadores de DINHEIRO (R$) e FAMA, ambos começando em 0.
- Menu da garagem: TOCAR, EQUIPAMENTOS, CONTRATAR e STATUS, com a descrição da opção
  selecionada. Navegação por teclado (↑/↓, W/S, Enter/Espaço) e mouse (hover e clique).
  As opções são só interface: ao ativá-las aparece um aviso ("EM BREVE!"); TOCAR fica
  disponível visualmente, mas avisa que o minigame ainda não existe.
- ESC (ou o botão "< MENU") volta ao menu inicial, como antes. A carreira continua guardada, então
  "NOVO JOGO" abre a seleção com ela já marcada.
- Se a garagem for aberta sem carreira escolhida, a plaquinha mostra "SEM CARREIRA".

**Organização**

- `src/ui/GarageRoom.js` cenário: imagem estática 192x108 (ampliada 5x, casando com o
  personagem) desenhada por código + animações de ambiente.
- `src/ui/PlayerHud.js`, `src/ui/icons.js` (moeda e estrela), `src/ui/Toast.js` componentes novos.
- `src/data/garageOptions.js` opções do menu; `src/systems/ProgressSystem.js` leitura de
  dinheiro e fama (por enquanto só os valores iniciais).
- `MenuList` ganhou alinhamento à esquerda, dicas por item (`hint`) e o callback `onChange`;
  `PixelButton` ganhou `fontSize`. O comportamento usado pelo menu inicial não mudou.

**Ainda não implementado**

- Minigame musical (TOCAR), loja de equipamentos, contratação de integrantes, tela de status,
  ganho/gasto de dinheiro e fama e qualquer forma de salvar o progresso.

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
