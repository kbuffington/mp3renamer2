import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class DontAllowOnReload implements CanActivate {
    private router: Router;

    // I initialize the secondary-view route guard.
    constructor(router: Router) {
        this.router = router;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot): boolean {
        if (this.isPageRefresh()) {
            this.router.navigate(['/']);
            return false;
        }
        return true;
    }

    private isPageRefresh(): boolean {
        return !this.router.navigated;
    }
}
