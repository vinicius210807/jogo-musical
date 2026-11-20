# Diário de desenvolvimento

## Minigame musical (GameScene) — primeira versão jogável

**O que foi feito**

- A opção TOCAR da garagem abre a `GameScene` com o fade padrão (`fadeToScene`). ESC volta à
  garagem (também na tela de resultado). A carreira escolhida continua no `registry` e o músico
  dela aparece no painel direito, pulando a cada tempo da música.
- Quatro pistas (D, F, J, K), cada uma com sua cor; notas em pixel art descem até a linha de acerto,
  destacada com faixa brilhante e receptores com a tecla de cada pista.
- Julgamento: PERFECT (erro até 70 ms, 100 pts), GOOD (71 a 130 ms, 50 pts) e MISS (erro acima de
  130 ms ou nota não acertada, 0 pts e quebra o combo). Apertar até 200 ms antes da nota conta como
  tentativa (vira MISS se passar de 130 ms); mais cedo que isso o toque é ignorado.
- Interface: pontuação, combo, maior combo, contagem de PERFECT/GOOD/MISS, avaliação em texto
  ("PERFECT!", "GOOD!", "MISS") e efeitos: anel e faíscas no acerto, pista piscando e nota
  escurecendo no erro. Contagem regressiva (PREPARE-SE, 3, 2, 1, VAI!) e barra de progresso.
- Tela de resultado: pontuação, maior combo, PERFECT/GOOD/MISS, precisão e nota (S/A/B/C), com
  JOGAR NOVAMENTE e VOLTAR À GARAGEM.
- Dinheiro e fama NÃO são alterados pelo minigame (fica para a próxima etapa).

**Sincronização**

- `SongClock` mede o tempo da música (ms) com `performance.now()`; o tempo 0 é o primeiro tempo da
  música e a contagem usa valores negativos. A posição de cada nota é calculada a cada quadro a partir
  desse tempo, e o julgamento usa o `timeStamp` do evento de teclado (o instante real em que a tecla
  foi apertada). Não há timers por nota, e a velocidade dos quadros não influencia o resultado.
- As notas ficam em dados: `src/data/songs.js` descreve cada compasso com 16 passos (`'1...2...'`) e
  `buildChart` converte para tempos em ms a partir do BPM (120 BPM na música de teste, 111 notas, 32 s).

**Áudio provisório**

- `SongAudio` sintetiza contagem, bateria e baixo com a Web Audio API (sem arquivos e sem direitos
  autorais), agendados no relógio do áudio, mais um som por nota acertada (uma nota da escala por pista).
- Preparado para uma faixa real: se a música tiver `audioKey` carregada no cache do Phaser, ela é tocada
  no tempo 0 no lugar da trilha sintetizada (ainda não testado, pois não há arquivo no projeto).

**Organização**

- `src/scenes/GameScene.js` cena; `src/data/songs.js` música e notas.
- `src/systems/JudgmentSystem.js` (julgamento), `ScoreSystem.js` (pontos e combo), `SongClock.js`,
  `SongAudio.js`. Os três primeiros são lógica pura, sem Phaser.
- `src/ui/Highway.js`, `RhythmHud.js`, `ResultsPanel.js`, `NoteSprites.js`, `HitEffects.js` componentes
  novos. `Toast` ganhou opções (cor, tempos, "pop") e `MenuList` ganhou `depth`.

**Limitações conhecidas**

- Sem pausa: se a aba perder o foco, a música segue e as notas são perdidas.
- Sem calibração de latência de áudio/entrada (há uma música só, e sem seleção de música).
- A trilha sintetizada é simples; só uma música de teste.
- Dinheiro, fama e progressão não são afetados pelo resultado.

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
