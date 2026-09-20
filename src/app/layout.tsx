import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ហាងឯកសណ្ឋានសិស្ស សម្តេចជាស៊ីម | Chea Sim Primary Uniform & Inventory',
  description: 'ប្រព័ន្ធគ្រប់គ្រងស្តុក និងកម្ម៉ង់ឯកសណ្ឋានសិស្សតាមអនឡាញ សម្រាប់សាលាបឋមសិក្សា សម្តេចជាស៊ីម',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="km">
      <body className="antialiased selection:bg-school-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
