import { SymbolTable } from "./interpreter/context/SymbolTable";
import { BuiltInFunction } from "./interpreter/values/BuiltInFunction";
import { Number } from "./interpreter/values/Number";
import { Uniform } from './interpreter/context/Uniform';

const keywords = [
    "put", // Stores variable.
    "const", // Makes a variable unchangable.
    "if", // If statement
    "else",
    "elif",
    "while", // While loop
    "end", // End of a func
    "task", // Func def
    "return", // Return statement
    "get", // Gets everything in symboltable from another file
    "not",
    "and",
    "or"
];

const nums = "1234567890";
const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const globalSymbolTable = new SymbolTable();
globalSymbolTable.set("null", Number.null);
globalSymbolTable.set("true", Number.true);
globalSymbolTable.set("false", Number.false);

globalSymbolTable.set("out", new BuiltInFunction("out"));
globalSymbolTable.set("in", new BuiltInFunction("in"));

globalSymbolTable.symbols = {
    ...new Uniform().symbolTable.symbols,
    ...globalSymbolTable.symbols
}

export {
    nums,
    letters,
    keywords,
    globalSymbolTable
}