import Phaser from 'phaser';

// Troca de cena com fade para preto. Retorna false se uma troca já estiver em andamento
// (evita disparar duas vezes com cliques ou teclas repetidas). A cena deve zerar
// `this.transitioning = false` no início do `create()`.
export function fadeToScene(scene, sceneKey, duration = 500) {
    if (scene.transitioning) return false;
    scene.transitioning = true;

    const camera = scene.cameras.main;
    camera.fadeOut(duration, 0, 0, 0);
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        scene.scene.start(sceneKey);
    });
    return true;
}
