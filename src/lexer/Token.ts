import { TokenType } from '../types';
import { Position } from '../utils';

export class Token {
    
    type: TokenType;
    value: string;
    posStart: Position;
    posEnd: Position;

    constructor(type_: TokenType, value: string, posStart: Position, posEnd?: Position) {
        this.type = type_;
        this.value = value;
        this.posStart = posStart.copy();
        this.posEnd = posStart.copy();
        this.posEnd.advance();
        if(posEnd)
            this.posEnd = posEnd;
    }

    matches(type_: TokenType, value: string): boolean {
        return this.type == type_ && this.value == value;
    }

    toString(): string {
        if(this.value) return `${this.type}:${this.value}`;
        return this.type;
    }
}