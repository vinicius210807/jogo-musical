import { getCareerById } from '../data/careers.js';

// Guarda a carreira escolhida no registry do Phaser, que é compartilhado por
// todas as cenas e dura enquanto o jogo estiver aberto.
const REGISTRY_KEY = 'career';

export function setCareer(scene, careerId) {
    scene.registry.set(REGISTRY_KEY, careerId);
}

// Retorna o objeto da carreira escolhida (ver src/data/careers.js) ou undefined.
export function getCareer(scene) {
    return getCareerById(scene.registry.get(REGISTRY_KEY));
}
