import { Injectable } from '@angular/core';
import { MetadataObj } from '@classes/track.classes';

import { TrackService } from './track.service';


@Injectable()
export class TitleFormatService {
    private fbPropToMetadataProp = {
        '%album%': { prop: 'album' },
        '%album artist%': { prop: 'performerInfo' },
        '%artist%': { prop: 'artist' },
        '%date%': { prop: 'date' },
        '%discnumber%': { prop: 'partOfSet', methodName: 'getDiscVal', methodParam: false },
        '%folder%': { prop: 'unused', methodName: 'getFolder' },
        '%path%': { prop: 'unused', methodName: 'getPath' },
        '%totaldiscs%': { prop: 'partOfSet', methodName: 'getDiscVal', methodParam: true },
        '%tracknumber%': { prop: 'trackNumber' },
        '%title%': { prop: 'title' },
    };

    constructor(private ts: TrackService) {}

    public eval(tf: string, index?: number): string {
        const metadata = this.ts.getCurrentMetadata();
        const valRegex = new RegExp(/%[^%]*%/, 'g');
        const formattedString = tf.replace(valRegex, (match) => {
            const propObj = this.fbPropToMetadataProp[match];
            if (propObj) {
                if (propObj.methodName) {
                    return this[propObj.methodName](metadata, propObj.prop, index, propObj.methodParam);
                } else {
                    const prop = metadata[propObj.prop];
                    return index ? prop.values[index] : prop.default;
                }
            } else {
                return match;
            }
        });

        // needs to be recursive
        // const funcRegex = new RegExp(/\$[^(]+\(([^)]+)\)/);

        return formattedString;
    }

    private getDiscVal(metadata: MetadataObj, prop: string, index: number, total: boolean): string {
        if (index !== 0 && !index) return '';
        const setVal = metadata[prop].values[index].split('/');
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
}
