import { RTError } from '../../utils';
import { Value } from './Value';

export class Number extends Value {
    static null = new Number(0);
    static false = new Number(0);
    static true = new Number(1);

    value: number;

    constructor(value: number) {
        super("Number");
        this.setPos();
        this.setContext();
        this.value = value;
    }

    addedTo(other: Value): any {
        if(other instanceof Number) {
            console.log(new Number(this.value + other.value).setContext(this.context));
            return new Number(this.value + other.value).setContext(this.context)
        } else {
            return this.illegalOperation(this, other);
        }
    }

    subbedBy(other: Value): any {
        if(other instanceof Number) {
            return new Number(this.value - other.value).setContext(this.context)
        } else {
            return this.illegalOperation(this, other);
        }
    }

    multedBy(other: Value): any {
        if(other instanceof Number) {
            return new Number(this.value * other.value).setContext(this.context)
        } else {
            return this.illegalOperation(this, other);
        }
    }

    divedBy(other: Value): any {
        if(other instanceof Number) {
            if(other.value == 0) {
                return RTError(
                    'Division by zero',
                    this.context,
                    other.posStart, other.posEnd
                );
            }
            return new Number(this.value / other.value).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonEq(other: Value): any {
        if(other instanceof Number) {
            return new Number(+(this.value == other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonNe(other: Value): any {
        if(other instanceof Number) {
            return new Number(+(this.value != other.value)).setContext(this.context);
        } else {
            return Number.false;
        }
    }

    getComparisonLt(other: Value): any {
        if(other instanceof Number) {
            return new Number(+(this.value < other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonGt(other: Value): any {
        if(other instanceof Number) {
            return new Number(+(this.value > other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonLte(other: Value): any {
        if(other instanceof Number) {
            return new Number(+(this.value <= other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    getComparisonGte(other: Value): any {
        if(other instanceof Number) {
            return new Number(+(this.value >= other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    andedBy(other: Value): any {
        if(other instanceof Number) {
            return new Number(+(this.value && other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    oredBy(other: Value): any {
        if(other instanceof Number) {
            return new Number(+(this.value || other.value)).setContext(this.context);
        } else {
            return this.illegalOperation(this, other);
        }
    }

    notted() {
        return new Number(this.value == 0 ? 1 : 0).setContext(this.context);
    }

    isTrue() {
        return this.value != 0;
    }

    copy() {
        let copy = new Number(this.value);
        copy.setPos(this.posStart, this.posEnd);
        copy.setContext(this.context);
        return copy;
    }

    toString() {
        return this.value.toString();
    }

    logging() {
        return this.value.toString();
    }
}