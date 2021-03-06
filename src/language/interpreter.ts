import { readFileSync } from "fs"
import { Regexs } from "../util/regex";
import { handler } from "./handler";

export type Word = {
    type: string;
    name: any;
    line: Line;
    numberOnLine: number;
}

export type Line = {
    fullValue: string;
    splitValue: string[];
    number: number;
}

export class Interpreter {
    words: Word[] = [];
    lines: Line[] = [];

    constructor(file: string) {
        let i: number = 0;
        readFileSync(file, "utf8").split("\n").map(l => l.replaceAll("\r", "")).forEach(line => {
            i++
            this.lines.push({
                fullValue: line,
                splitValue: line.split(" "),
                number: i
            });
            let j: number = 0;
            new Regexs().code(line).forEach(word => {
                this.wordAssigment(word, this.lines[i - 1], j);
                j++;
            });
        });
        handler(this.words, this.lines);
    }

    private wordAssigment(word: string, line: Line, numberOnLine: number = 0): void {
        switch (true) {
            case word.toUpperCase() === word && new Regexs().testWord(word):
                this.words.push({ type: "builtin", name: word, line: line, numberOnLine: numberOnLine });
                break;
            case word == String("True") || word === String("False"):
                this.words.push({ type: "boolean", name: word, line: line, numberOnLine: numberOnLine });
                break;
            case word.startsWith("\"") && word.endsWith("\"") || word.startsWith("'") && word.endsWith("'"):
                this.words.push({ type: "string", name: word, line: line, numberOnLine: numberOnLine });
                break;
            case !isNaN(parseFloat(word)) && parseFloat(word) != parseInt(word):
                this.words.push({ type: "float", name: word, line: line, numberOnLine: numberOnLine });
                break;
            case !isNaN(parseFloat(word)) && parseFloat(word) == parseInt(word):
                this.words.push({ type: "int", name: word, line: line, numberOnLine: numberOnLine });
                break;
            case new Regexs().testWord(word):
                this.words.push({ type: "variable", name: word, line: line, numberOnLine: numberOnLine });
                break;
            default:
                throw new SyntaxError(`${word} is unknown, ${line.number}:${line.splitValue.indexOf(word)}`);
        }
    }

}