import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred.';

      if (error.status === 0) {
        message = 'Network error — please check your connection.';
      } else if (error.status === 401) {
        message = 'Session expired — please sign in again.';
      } else if (error.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.status >= 500) {
        message = 'Server error — please try again later.';
      } else if (error.error?.message) {
        message = error.error.message;
      }

      toast.error(message);
      return throwError(() => error);
    })
  );
};
