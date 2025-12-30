import { type NextRequest, NextResponse } from 'next/server';
import { withSystemAdminAuth } from '~/lib/apiMiddleware';
import { toggleSysAdminRedirectsLogic } from '~/services/users/mutation/sysAdminRedirects';

export async function POST(req: NextRequest) {
  return await withSystemAdminAuth(async (userId) => {
    try {
      const { noRedirects } = await req.json() as {
        noRedirects: boolean;
      };

      const success = await toggleSysAdminRedirectsLogic(userId, noRedirects);
      if (success) {
        return NextResponse.json({ message: 'SysAdmin redirects updated successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to update SysAdmin redirects' }, { status: 500 });
      }
    } catch (error) {
      console.error('Error resetting cache', error);
      return NextResponse.json({ error: 'Error updating SysAdmin redirects' }, { status: 500 });
    }
  })();
}
