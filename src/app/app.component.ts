import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	private showArtist = true;
	fileList: any[] = [];

	title = 'app';

	onChange(files) {
		this.fileList = files;
		console.log(files);
		for (let i = 0; i < this.fileList.length; i++) {
			this.fileList[i].path = URL.createObjectURL(this.fileList[i]);
		}

	}
}
