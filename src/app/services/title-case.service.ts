import { Injectable } from '@angular/core';
import { MetadataProperty } from '@classes/track.classes';

// TODO: the first five words should be used by the musicbrainz fuzzy search in ReplaceCommonWords()
// words that are lowercased if in the middle of a title (not first or last word)
export const lowerCaseWords = ['a', 'an', 'the', 'and', 'of', 'but', 'as', 'or', 'for', 'nor',
    'at', 'by', 'to', 'etc.', 'in', 'n\'', 'o\'', 'on',
    'vs', 'vs.'];

// Acronyms or other words that should always be upper case
export const upperCaseWords = ['DOA', 'LOL', 'LMAO', 'PCP', 'RIP', 'R&B', 'NWOBHM'];

// Words that should probably always be lower case
export const alwaysLowerCaseWords = ['remix', 'feat.', 'x'];

@Injectable({ providedIn: 'root' })
export class TitleCaseService {
    constructor() {}

    /**
     * Given a word which is just alpha-numeric characters, capitalize the first letter (if required)
     * and lowercase the rest. Also test if the word is an Acronym and ensure each letter is capitalized.
     * @param {string} word
     * @param {boolean} capitalizeFirstLetter
     * @return {string}
     */
    private titleCaseWord(word: string, capitalizeFirstLetter: boolean): string {
        let capWord = '';
        if (word.length) {
            const isAcronym = /^([a-zA-Z]\.)+(s)?$/;
            if (isAcronym.test(word)) {
                capWord = word.toLocaleUpperCase();
                if (capWord[capWord.length - 1] === 's') {
                    // plural acronyms like 'M.O.A.B.s'
                    capWord = capWord.slice(0, -1) + 's';
                }
            } else if (upperCaseWords.includes(word.toLocaleUpperCase())) {
                // acronyms like 'DOA'
                capWord = word.toLocaleUpperCase();
            } else if (alwaysLowerCaseWords.includes(word.toLocaleLowerCase())) {
                // words like 'remix'
                capWord = word.toLocaleLowerCase();
            } else if (capitalizeFirstLetter) {
                capWord = word[0].toUpperCase() + word.substr(1).toLocaleLowerCase();
            } else {
                capWord = word.toLocaleLowerCase();
            }
        }
        return capWord;
    }

    private titleCaseSection(str: string): string {
        let title = str;
        const hyphenIndexes = [];
        let blankStart = false;
        let blankEnd = false;
        title.split('').forEach((c, i) => {
            if (c === '-') {
                hyphenIndexes.push(i);
            }
        });
        const words = title.split(/[ -]/);
        if (words[0] === '') {
            blankStart = true;
            words.shift();
        }
        if (words[words.length - 1] === '') {
            blankEnd = true;
            words.pop();
        }
        const titleCaseWords = words.map((word, index) => {
            if (word.match(/^[^a-zA-Z\d]*$/)) {
                // only symbols
                return word;
            } else {
                // has letters to actually capitalize
                const wordStart = word.match(/^[^a-zA-Z\d.]*/)[0];
                const wordEnd = word.match(/[^a-zA-Z\d.]*$/)[0];
                word = word.slice(
                    wordStart.length,
                    wordEnd.length ? 0 - wordEnd.length : undefined,
                ); // strip non alphanum chars
                if (
                    index === 0 ||
                    index === words.length - 1 ||
                    wordStart === '(' ||
                    wordEnd === ')' ||
                    !lowerCaseWords.includes(word.toLocaleLowerCase())
                ) {
                    return wordStart + this.titleCaseWord(word, true) + wordEnd;
                }
                return wordStart + this.titleCaseWord(word, false) + wordEnd;
            }
        });
        title = titleCaseWords.join(' ');
        hyphenIndexes.forEach(i => {
            title = title.slice(0, i) + '-' + title.slice(i + 1);
        });
        return (blankStart ? ' ' : '') + title + (blankEnd ? ' ' : '');
    }

    /**
     * Given a string, split it up into subsections based on found paren blocks, and title case those
     * and then return the re-combined title-cased string.
     * @param {string} str The string to title-case
     * @return {string}
     */
    public titleCaseString(str: string): string {
        const parensRegex = /\((.*?)\)/g;
        const matches = str.matchAll(parensRegex);
        let offset = 0;
        const titleSections = [];
        for (const match of matches) {
            if (match.index > offset) {
                titleSections.push(str.substring(offset, match.index));
            }
            titleSections.push(match[0]);
            offset = match.index + match[0].length;
        }
        if (offset < str.length) {
            titleSections.push(str.substring(offset));
        }
        // console.log(titleSections);
        str = titleSections.map((section) => {
                return this.titleCaseSection(section);
            }).join('');

        return str;
    }

    /**
     * Given a string, find all words that _should_ always be lowercase, and
     * ensure they are in fact lowercase.
     * @param {string} str
     * @return {string}
     */
    public fixCapitalization(str: string): string {
        const words = str.split(' ');
        for (let i = 1; i < words.length - 1; i++) {
            const word = words[i].toLowerCase();
            if (lowerCaseWords.includes(word)) {
                words[i] = words[i].toLowerCase();
            }
        }
        return words.join(' ');
    }

    public hasBadCaps(titles: MetadataProperty): boolean {
        return titles.values.some(title => {
            const words = title.split(' ');
            for (let i = 1; i < words.length - 1; i++) {
                const word = words[i];
                if (lowerCaseWords.includes(word.toLowerCase()) && !lowerCaseWords.includes(word)) {
                    return true;
                }
            }
        });
    }
}
