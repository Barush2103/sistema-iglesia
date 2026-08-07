import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parroquia María Madre de Dios",
  description: "Sistema de control de catequesis y cooperaciones",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg: #f5f4f0;
            --surface: #ffffff;
            --border: #e8e6e0;
            --border-light: #f0ede8;
            --text: #1c1c1a;
            --text-2: #6b6860;
            --text-3: #9b9890;
            --gold: #b5883a;
            --gold-light: #f5eedd;
            --blue: #2563eb;
            --blue-light: #eff6ff;
            --green: #16a34a;
            --green-light: #f0fdf4;
            --red: #dc2626;
            --red-light: #fef2f2;
            --purple: #7c3aed;
            --purple-light: #f5f3ff;
            --radius: 10px;
            --shadow: 0 1px 3px rgba(0,0,0,0.07);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
          }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased; }
          button { cursor: pointer; font-family: inherit; }
          input, select, textarea { font-family: inherit; }
          @media print {
            .no-print { display: none !important; }
            body { background: white; }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
