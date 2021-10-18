import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GenreEntry, genreList } from '@services/genres';

@Component({
	selector: 'genre-select',
	templateUrl: './genre-select.component.html',
	styleUrls: ['./genre-select.component.scss']
})
export class GenreSelectComponent implements OnInit {
    @Input() genres: string;

    @Output() genreSelected = new EventEmitter<string>();

    public genreList: GenreEntry[] = genreList;
    public selectedGenres: GenreEntry[] = [];
    public selection;

    ngOnInit() {
        this.selectedGenres = this.getSelectedGenreEntries(this.genres);
        this.addDummyGenre();
    }

    private addDummyGenre() {
        this.genreList.push({ name: '```' });   // dummy genre to be replaced
    }

    private getSelectedGenreEntries(genreString: string) {
        const genres = genreString.split(';').map(genre => genre.trim());
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
        let genreStrings = "";
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
}