import { Injectable } from '@angular/core';
import { MetadataObj, MetadataProperty } from '@classes/track.classes';

import { TrackService } from './track.service';


@Injectable({ providedIn: 'root' })
export class TitleFormatService {
    private fbPropToMetadataProp = {
        'album artist': { prop: 'performerInfo' },
        'folder': { prop: 'unused', methodName: 'getFolder' },
        'path': { prop: 'unused', methodName: 'getPath' },
        'albumsortorder': { prop: 'albumSortOrder' },
        'artistsortorder': { prop: 'artistSortOrder' },
        // properties below require an index as they are track specific
        'discnumber': { prop: 'partOfSet', methodName: 'getDiscVal', methodParam: false },
        'totaldiscs': { prop: 'partOfSet', methodName: 'getDiscVal', methodParam: true },
        'tracknumber': { prop: 'trackNumber' },
    };

    private fbFunctionEval = {
        'year': { name: 'getYear' },
        'lower': { name: 'lower' },
        'roman': { name: 'roman' },
        'upper': { name: 'upper' },
    }

    constructor(private ts: TrackService) {}

    /**
     * Evaluates a title-formatting string.
     * @param {string} tf The string to evaluate
     * @param {number} index The index of the track to evaluate on, defaults to 0.
     * @return {string}
     */
    public eval(tf: string, index = 0): string {
        if (!tf.length) return '';
        const funcRegex = new RegExp(/\$([a-zA-Z]+)\((.*)/);
        tf = tf.replace(funcRegex, (match, funcName, contents: string) => {
            // recurse through functions
            let openCount = 1;
            let closeIndex = -1; // TODO: handle unclosed parens better?
            for (let i = 0; i < contents.length; i++) {
                const char = contents[i];
                if (char === '(') openCount++;
                if (char === ')') openCount--;
                if (openCount === 0) {
                    closeIndex = i;
                    break;
                }
            }
            if (closeIndex === -1) {
                return `$${funcName}(<NOT CLOSED>${this.eval(contents)}`;
            }
            const funcContents = contents.substring(0, closeIndex);
            const afterContents = contents.substring(closeIndex + 1); // not in func

            // console.log(funcName, funcContents, afterContents);

            const evaledSubstr = this.eval(funcContents, index);
            const method = this.fbFunctionEval[funcName];
            const evaledAfter = this.eval(afterContents, index);
            if (method) {
                return `${this[method.name](evaledSubstr)}${evaledAfter}`;
            } else {
                return `${funcName}(${funcContents})${evaledAfter}`;
            }
        });
        const metadata = this.ts.getCurrentMetadata();
        const valRegex = new RegExp(/%([^%]*)%/, 'g');
        const formattedString = tf.replace(valRegex, (match, substring) => {
            const propObj = this.fbPropToMetadataProp[substring];
            if (propObj) {
                if (propObj.methodName) {
                    return this[propObj.methodName](metadata, propObj.prop, index, propObj.methodParam);
                } else {
                    const prop = metadata[propObj.prop];
                    return index ? prop.values[index] : prop.default;
                }
            } else {
                const prop = this.findProp(metadata, substring);
                if (prop) {
                    return index ? prop.values[index] : prop.default;
                }
                return match;
            }
        });

        // needs to be recursive
        // const funcRegex = new RegExp(/\$[^(]+\(([^)]+)\)/);

        return formattedString;
    }

    private findProp(metadata: MetadataObj, propName: string): MetadataProperty {
        return metadata[propName] ??
            metadata[propName.toLocaleLowerCase()] ??
            metadata[propName.toLocaleUpperCase()] ?? null;
    }

    private getDiscVal(metadata: MetadataObj, prop: string, index: number, total: boolean): string {
        if (index !== 0 && !index) return '';
        const setVal = metadata[prop].values[index]?.split('/');
        if (!setVal) return '';
        if (total) {
            return setVal.length === 2 ? setVal[1] : '';
        } else {
            return setVal[0];
        }
    }

    private getPath(metadata: MetadataObj, prop: string, index: number): string {
        if (index !== 0 && !index) return '';
        const tracks = this.ts.getCurrentTracks();
        return tracks[index].meta.folder + tracks[index].meta.filename;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private getFolder(metadata: MetadataObj, prop: string, index: number): string {
        return this.ts.getCurrentPath();
    }

    private getYear(date: string): string {
        const yearRegex = new RegExp(/\b(\d{4})\b/).exec(date);
        return yearRegex?.[1] ?? '?';
    }

    private upper(str: string): string {
        return str.toLocaleUpperCase();
    }

    private lower(str: string): string {
        return str.toLocaleLowerCase();
    }

    private roman(num: number|string): string {
        return this.ts.alphaRoman(num);
    }
}
