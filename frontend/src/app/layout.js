import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'Clueso - AI-Powered Feedback Management',
  description: 'Collect, organize, and analyze user feedback with AI-powered insights and real-time updates.',
  keywords: 'feedback, ai, dashboard, analytics, user experience',
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}