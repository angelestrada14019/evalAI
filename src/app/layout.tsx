
// This file is intentionally minimal.
// The main layout, including <html> and <body>, is in /[locale]/layout.tsx
// to ensure the locale is available for all rendered content.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
