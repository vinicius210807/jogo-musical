import { DEFAULT_SONG, getSongById } from '../data/songs.js';

// Guarda a música escolhida no registry do Phaser (como a carreira). A GameScene lê daqui,
// então o replay mantém a mesma música e o mesmo chart.
const REGISTRY_KEY = 'songId';

export function setSelectedSong(scene, songId) {
    scene.registry.set(REGISTRY_KEY, songId);
}

// Música escolhida (ver src/data/songs.js); se nada foi escolhido, a primeira do catálogo.
export function getSelectedSong(scene) {
    return getSongById(scene.registry.get(REGISTRY_KEY)) ?? DEFAULT_SONG;
}
