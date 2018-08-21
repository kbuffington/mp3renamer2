import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';

@Component({
  selector: 'request-files',
  templateUrl: './request-files.component.html',
  styleUrls: ['./request-files.component.scss']
})
export class RequestFilesComponent implements OnInit {
	constructor(private http: Http) { }

	ngOnInit() {}

	requestFiles() {
		this.http.post('http://localhost:666/command/file', {})
			.subscribe(
				data => data,
				error => console.log(error));
	}

}
