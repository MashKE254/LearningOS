'use client';

import { ModeProvider } from '@/lib/modes';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModeProvider initialMode="LEARN" persistState={true}>
      {children}
    </ModeProvider>
  );
}
