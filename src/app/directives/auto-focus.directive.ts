import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
	selector: '[autofocus]'
})
export class AutoFocusDirective implements OnInit {
	private _autofocus;

	constructor(private el: ElementRef, private renderer: Renderer2) { }

	ngOnInit() {
		if (this._autofocus || typeof this._autofocus === 'undefined') {
			this.el.nativeElement.focus();
		}
	}

	@Input() set autofocus(condition: boolean) {
		this._autofocus = condition !== false;
	}
}
