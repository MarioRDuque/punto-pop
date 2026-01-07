import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable()
export class IconService {
    public http = inject(HttpClient);

    icons!: object[];

    selectedIcon: any;

    apiUrl = 'assets/demo/data/icons.json';

    getIcons() {
        return this.http.get(this.apiUrl).pipe(
            map((response: any) => {
                this.icons = response.icons;
                return this.icons;
            })
        );
    }
}
