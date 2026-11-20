const realNow = () => performance.now();

// Relógio da música: tempo (ms) decorrido desde o início da faixa. É a única referência
// para posicionar as notas e julgar os toques, então nada depende da taxa de quadros.
// O tempo 0 é o primeiro tempo da música; antes dele vem a contagem (valores negativos).
export default class SongClock {
    // `nowFn` só é trocado nos testes, para simular a passagem do tempo.
    constructor(nowFn = realNow) {
        this.nowFn = nowFn;
        this.useEventTimestamps = nowFn === realNow;
        this.origin = 0;
    }

    // Faz o tempo 0 acontecer daqui a `leadInMs`.
    start(leadInMs) {
        this.origin = this.nowFn() + leadInMs;
    }

    now() {
        return this.nowFn() - this.origin;
    }

    // Instante de um evento do teclado na linha do tempo da música. O `timeStamp` do
    // evento marca quando a tecla foi realmente apertada (e não quando o quadro
    // seguinte processou o evento), então o julgamento fica preciso mesmo a poucos FPS.
    eventTime(event) {
        if (this.useEventTimestamps && event?.timeStamp) return event.timeStamp - this.origin;
        return this.now();
    }
}
