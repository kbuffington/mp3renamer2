import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ValuesWrittenService {
    private valuesWritten = new BehaviorSubject<boolean>(true);

    get(): Observable<boolean> {
        return this.valuesWritten.asObservable();
    }

    getValue(): boolean {
        return this.valuesWritten.getValue();
    }

    markDirty() {
        if (this.valuesWritten.getValue()) {
            this.valuesWritten.next(false);
        }
    }

    markWritten() {
        this.valuesWritten.next(true);
    }
}
