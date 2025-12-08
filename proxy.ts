import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const middleware = createMiddleware(routing);

export function proxy(request: any) {
    return middleware(request);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
