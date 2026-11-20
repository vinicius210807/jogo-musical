// Dinheiro e fama do jogador, guardados no registry do Phaser (como a carreira).
// Nesta etapa só existe a LEITURA: todo jogador começa do zero. Ganhar, gastar e
// salvar esses valores virá junto com o minigame e a loja.
const STARTING_PROGRESS = { money: 0, fame: 0 };

export function getProgress(scene) {
    return {
        money: scene.registry.get('money') ?? STARTING_PROGRESS.money,
        fame: scene.registry.get('fame') ?? STARTING_PROGRESS.fame
    };
}
