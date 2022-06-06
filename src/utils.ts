import { Context } from './interpreter/context/Context';
import { UniErr } from './types';
export class Position {

    idx: number;
    ln: number;
    col: number;
    fn: string;
    ftxt: string;

    constructor(idx: number, ln: number, col: number, fn: string, ftxt: string) {
        this.idx = idx;
        this.ln = ln;
        this.col = col;
        this.fn = fn;
        this.ftxt = ftxt;
    }

    advance(currentChar?: string) {
        this.idx++;
        this.col++;

        if(currentChar == '\n') {
            this.ln++;
            this.col = 0;
        }

        return this;
    }

    copy(): Position {
        return new Position(this.idx, this.ln, this.col, this.fn, this.ftxt);
    }

}

export function UniformError(name: string, details: string, posStart: Position, posEnd: Position): UniErr {
    let result = `UNIFORM ERROR: ${name}: ${details}\n`;
    result += `File ${posStart.fn}, line ${posStart.ln + 1}`;
    result += `\n\n${stringWithArrows(posStart.ftxt, posStart, posEnd)}`;

    return {
        log: () => {
            console.error(result);
        }
    }
}

export function IllegalCharError(details: string, posStart: Position, posEnd: Position): UniErr {
    return UniformError("Invalid Token", details, posStart, posEnd);
}

export function ExpectedCharError(details: string, posStart: Position, posEnd: Position): UniErr {
    return UniformError("Expected Character", details, posStart, posEnd);
}

export function InvalidSyntaxError(details: string, posStart: Position, posEnd: Position): UniErr {
    return UniformError("Invalid Syntax", details, posStart, posEnd);
}

export function RTError(details: string, ctx: Context, posStart: Position, posEnd: Position): UniErr {
    function generateTraceback(pos: Position, ctx: Context) {
        let result = "";

        while(ctx) {
            result = `  File ${pos.fn}, line ${pos.ln + 1}, in ${ctx.displayName}\n${result}`;
            pos = ctx.parentEntryPos;
            ctx = ctx.parent;
        }

        return `Traceback (most recent call last):\n${result}`
    }

    let result = generateTraceback(posStart, ctx);
    result += `UNIFORM ERROR: Runtime Error: ${details}`;
    result += `\n\n${stringWithArrows(posStart.ftxt, posStart, posEnd)}`;

    return {
        log: () => {
            console.error(result);
        }
    }
}

export function UniformWarning(name: string, details: string, posStart: Position, posEnd: Position) {
    let result = `UNIFORM WARNING: ${name}: ${details}\n`;
    result += `File ${posStart.fn}, line ${posStart.ln + 1}`;
    result += `\n\n${stringWithArrows(posStart.ftxt, posStart, posEnd)}`;

    console.warn(result);
}

export function stringWithArrows(text: string, posStart: Position, posEnd: Position) {
    var result = '';

    var idxStart = Math.max(text.lastIndexOf('\n', posStart.idx), 0);
    var idxEnd = text.indexOf('\n', idxStart + 1)
    if(idxEnd < 0) idxEnd = text.length;

    var lineCount = posEnd.ln - posStart.ln + 1
    for(var i = 0; i < lineCount; i++) {
        var line = text.substring(idxStart, idxEnd);
        var colStart;
        if(i == 0) colStart = posStart.col
        else colStart = 0;
        var colEnd;
        if(i == lineCount - 1) colEnd = posEnd.col
        else colEnd = line.length - 1;
        
        result += line + '\n';
        result += " ".repeat(colStart)
        result += "^".repeat((colEnd - colStart))

        idxStart = idxEnd;
        idxEnd = text.indexOf('\n', idxStart + 1)
        if(idxEnd < 0) idxEnd = text.length;
    }

    return result;
}

export function getattr(obj: any, prop: any, defaultValue: Function=null!) {
    if(prop in obj) {
        let val = obj[prop]!;
        if(typeof val === 'function')
            return val.bind(obj);
        return val;
    }

    if(arguments.length > 2) {
        return defaultValue;
    }

    throw new TypeError(`"${obj}" object has no attribute "${prop}"`);
}

export function getStringValue(value: any): string {
    return String(value);
}

export function isError(res: UniErr): res is UniErr {
    return (res as UniErr).log !== undefined;
}