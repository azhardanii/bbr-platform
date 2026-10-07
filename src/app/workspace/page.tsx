import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import WorkspaceClient from './WorkspaceClient';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';

export default async function WorkspacePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <AuthGuard />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading Workspace...</div>}>
          <WorkspaceClient />
        </Suspense>
      </div>
    </div>
  );
}
