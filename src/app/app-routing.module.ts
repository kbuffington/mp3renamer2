import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetMetadataComponent } from '@components/get-metadata/get-metadata.component';
import { MainComponent } from '@components/main/main.component';

const routes: Routes = [
	{ path: '', component: MainComponent },
	{ path: 'metadata', component: GetMetadataComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
