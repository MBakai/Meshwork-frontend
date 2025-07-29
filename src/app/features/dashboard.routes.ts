import { Routes } from "@angular/router";
import { authGuard } from "../shared/guards/auth.guard";


export const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'boards',
        pathMatch: 'full'
      },
      {
        path: 'boards',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./boards/board/board.component').then(m => m.BoardComponent),
      },
      {
        path: 'task',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./boards/task/task.component').then(m => m.TaskComponent),
      },
      {
        path: 'task-detalis/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./boards/task-board/task-board.component').then(m => m.TaskBoardComponent),
      },
      // {
      //   path: 'subtask',
      //   canActivate: [authGuard],
      //   loadComponent: () =>
      //     import('./boards/subtask/subtask.component').then(m => m.SubtaskComponent),
      // },
      {
        path: 'users',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./users/users.component').then(m => m.UsersComponent),
      }
    ]
  }
];