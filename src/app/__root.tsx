import '~/styles/globals.css';
import { Outlet, createRootRoute, HeadContent, Scripts, } from '@tanstack/react-router';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Your Fantasy Survivor',
        description: 'A fantasy league for the TV show Survivor',
        icons: [{ rel: 'icon', url: '/Icon.ico' }],
      }
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang='en'>
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
