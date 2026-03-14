"use client";

import { ReactNode } from "react";

interface MainLayoutProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export function MainLayout({ leftPanel, rightPanel }: MainLayoutProps) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-[440px] min-w-[380px] border-r border-border overflow-y-auto bg-background">
        {leftPanel}
      </aside>
      <main className="flex-1 relative">
        {rightPanel}
      </main>
    </div>
  );
}
