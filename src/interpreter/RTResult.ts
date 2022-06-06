import { Value } from "./values/Value";
import { UniErr } from '../types';

export class RTResult {
    value!: Value;
    error!: UniErr;
    funcReturnValue!: Value;
    loopShouldContinue: boolean = false;
    loopShouldBreak: boolean = false;

    constructor() {
        this.reset();
    }

    reset() {
        this.value = null!;
        this.error = null!;
        this.funcReturnValue = null!;
        this.loopShouldContinue = false;
        this.loopShouldBreak = false;
    }

    register(res: RTResult): Value {
        this.error = res.error;
        this.funcReturnValue = res.funcReturnValue;
        this.loopShouldContinue = res.loopShouldContinue;
        this.loopShouldBreak = res.loopShouldBreak;
        return res.value;
    }

    success(value: Value): RTResult {
        this.reset();
        this.value = value;
        return this;
    }

    successReturn(value: Value): RTResult {
        this.reset()
        this.funcReturnValue = value;
        return this;
    }

    successContinue() {
        this.reset();
        this.loopShouldContinue = true;
        return this;
    }

    successBreak() {
        this.reset();
        this.loopShouldBreak = true;
        return this;
    }

    failure(error: UniErr) {
        this.reset();
        this.error = error;
        return this; 
    }

    shouldReturn() {
        return (this.error || this.funcReturnValue || this.loopShouldBreak || this.loopShouldContinue);
    }

}