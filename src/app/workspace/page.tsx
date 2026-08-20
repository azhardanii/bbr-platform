import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import WorkspaceClient from './WorkspaceClient';

export default function WorkspacePage() {
  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading Workspace...</div>}>
        <WorkspaceClient />
      </Suspense>
    </div>
  );
}
