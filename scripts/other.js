import alea from "alea";

export default class Random {
    #rng;
    #seed;

    constructor(seed) {
        this.#seed = seed;
        console.log("SEED: ", seed);
        this.#rng = alea(this.#seed);
    }

    SetRandNumGen(seed) {
        this.#seed = seed;
        this.#rng = alea(this.#seed);
    }
    GetRandNumGen() {
        return this.#rng;
    }

    Range(min, max) {
        return Math.floor(this.#rng() * (max-min+1) + min);
    }
    
    PosNeg() {
        let res = Math.round(this.Range(-1, 1));
        if (res == 0) {
            this.PosNeg();
        }
        return res;
    }
}
