import React from 'react';

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-[calc(100vh-theme(space.16)-1px)]">{children}</div>;
}
