import { Routes } from '@angular/router';
import { Auth } from './components/auth/auth';
import { Dashboard } from './components/dashboard/dashboard';



export const routes: Routes = [

    {
        path:'',
        pathMatch:'full',
        component:Auth
    },
    {
        path:'dashboard',
        pathMatch:'full',
        component:Dashboard
    },
    
];
