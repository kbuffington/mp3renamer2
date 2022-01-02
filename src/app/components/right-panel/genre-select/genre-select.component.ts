import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { ArtistData, ArtistTag } from '@classes/musicbrainz.classes';
import { ArtistCacheService } from '@services/artist-cache.service';
import { GenreEntry, genreList } from '@services/genres';
import { MusicbrainzService } from '@services/musicbrainz.service';
import { TitleCaseService } from '@services/title-case.service';
import { TrackService } from '@services/track.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'genre-select',
    templateUrl: './genre-select.component.html',
    styleUrls: ['./genre-select.component.scss'],
})
export class GenreSelectComponent implements OnInit, OnChanges, OnDestroy {
    @Input() genres: string;

    @Output() genreSelected = new EventEmitter<string>();

    public genreList: GenreEntry[] = genreList;
    public selectedGenres: GenreEntry[] = [];
    public selection;
    public showGuessButton = false;

    private metadataSub: Subscription;

    constructor(private ts: TrackService,
                private title: TitleCaseService,
                private mb: MusicbrainzService,
                private ac: ArtistCacheService) {
        this.metadataSub = ts.getMetadata().subscribe(m => {
            this.showGuessButton = !!m.MUSICBRAINZ_ARTISTID.default;
        });
    }

    ngOnInit() {}

    ngOnChanges() {
        this.selectedGenres = this.getSelectedGenreEntries(this.genres);
        this.addDummyGenre();
    }

    ngOnDestroy() {
        this.metadataSub.unsubscribe();
    }

    private addDummyGenre() {
        this.genreList.push({ name: '```' }); // dummy genre to be replaced
    }

    private getSelectedGenreEntries(genreString: string): GenreEntry[] {
        const genres = genreString.split(';').map(genre => genre.trim()).filter(g => g);
        return genres.map(genre => {
            let foundGenre = this.genreList.find(g => genre === g.name);
            if (!foundGenre) {
                foundGenre = { name: genre };
                genreList.push(foundGenre);
            }
            return foundGenre;
        });
    }

    public updateSelection(genre: GenreEntry[]) {
        let genreStrings = '';
        if (genre) {
            const genres = Array.isArray(genre) ? genre : [genre];
            if (genres.filter(g => g.name === this.genreList[this.genreList.length - 1].name)) {
                this.addDummyGenre();
            }
            genreStrings = genres.map(g => g.name).join('; ');
        }
        this.genreSelected.emit(genreStrings);
    }

    public inputChanged(text) {
        if (text.length > 2 && !this.genreList.find(g => g.name === text)) {
            this.genreList[this.genreList.length - 1] = { name: text };
        }
    }

    public guessGenres() {
        const artistId = this.ts.getCurrentMetadata().MUSICBRAINZ_ARTISTID.default;
        if (artistId) {
            const artist = this.ac.get(artistId);
            if (!artist) {
                this.mb.getArtists([artistId]).then(artistData => {
                    const artist = new ArtistData(artistData.artists[0]);
                    this.setArtistGenres(artist);
                    if (artist.country) {
                        this.ac.set(artist);
                    } else if (artistData.area) {
                        // see get-metadata
                        this.mb.getCountry(artistData.area.id).then(country => {
                            artist.country = country;
                            this.ac.set(artist);
                        });
                    }
                });
            } else {
                this.setArtistGenres(artist);
            }
        }
    }

    private setArtistGenres(artist: ArtistData) {
        const tags = artist.tags.sort((a: ArtistTag, b: ArtistTag) => b.count - a.count);
        console.log(tags);
        this.genres = tags.filter((a, index) => index < 5)
            .map(t => this.title.titleCaseString(t.name)).join('; ');
        this.ngOnChanges();
    }
}
