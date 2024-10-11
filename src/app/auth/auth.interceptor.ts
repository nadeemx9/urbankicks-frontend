import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const authInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('token');  // Retrieve token from localStorage directly

  if (token) {
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle token expiration or unauthorized access
          localStorage.removeItem('token'); // Remove expired token
          // Redirect to login
          window.location.href = '/login';
        }
        return throwError(() => new Error(error.message));
      })
    );
  }
  return next(req);
};
