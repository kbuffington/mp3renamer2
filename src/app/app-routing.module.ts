import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetMetadataComponent } from '@components/get-metadata/get-metadata.component';
import { MainComponent } from '@components/main/main.component';
import { DontAllowOnReload } from './dont-allow-on-reload.guard';

const routes: Routes = [
	{ path: '', component: MainComponent },
	{ path: 'metadata', component: GetMetadataComponent, canActivate: [DontAllowOnReload] },
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
	exports: [RouterModule]
})
export class AppRoutingModule { }
