import { HttpHandlerFn, HttpRequest } from '@angular/common/http';

export const authInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('token');  // Retrieve token from localStorage directly

  if (token) {
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedRequest);
  }
  return next(req);
};
