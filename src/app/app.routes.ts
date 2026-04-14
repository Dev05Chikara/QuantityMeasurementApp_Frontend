import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { ArithmeticComponent } from './pages/arithmetic/arithmetic.component';
import { CompareComponent } from './pages/compare/compare.component';
import { ConvertComponent } from './pages/convert/convert.component';
import { HistoryComponent } from './pages/history/history.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { OperationsComponent } from './pages/operations/operations.component';
import { SignupComponent } from './pages/signup/signup.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'operations', component: OperationsComponent },
  { path: 'convert', component: ConvertComponent },
  { path: 'compare', component: CompareComponent },
  { path: 'arithmetic', component: ArithmeticComponent },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  { path: '**', redirectTo: '' }
];