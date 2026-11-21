import { getCareerById } from '../data/careers.js';
import { getCareerProgress } from './CareerProgress.js';

// Carreira escolhida: guardada no salvamento local (ver CareerProgress), então continua
// valendo depois de fechar e reabrir o navegador. O parâmetro `scene` é mantido para que
// as cenas continuem chamando do mesmo jeito.
export function setCareer(scene, careerId) {
    getCareerProgress().setCareer(careerId);
}

// Retorna o objeto da carreira escolhida (ver src/data/careers.js) ou undefined.
export function getCareer(scene) {
    return getCareerById(getCareerProgress().careerId);
}
