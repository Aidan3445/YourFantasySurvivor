import { type QueryClient } from '@tanstack/query-core';

export { };

declare global {
  interface CustomJwtSessionClaims {
    userId?: string;
  }
}

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
    QueryClient;
  }
}
