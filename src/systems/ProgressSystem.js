import { getCareerProgress } from './CareerProgress.js';

// Dinheiro e fama atuais do jogador (vêm do salvamento; começam em zero).
export function getProgress(scene) {
    const { money, fame } = getCareerProgress();
    return { money, fame };
}
