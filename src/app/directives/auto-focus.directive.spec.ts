import { ElementRef } from '@angular/core';
import { AutoFocusDirective } from './auto-focus.directive';

export class MockElementRef extends ElementRef {
    constructor() {
        super(null);
    }
}

describe('AutoFocusDirective', () => {
    it('should create an instance', () => {
        const el = new MockElementRef();
        const directive = new AutoFocusDirective(el);
        expect(directive).toBeTruthy();
    });
});
