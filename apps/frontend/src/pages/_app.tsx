import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter, Outfit } from 'next/font/google';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Layout } from '@/components/layout/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter();
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className={`${inter.variable} ${outfit.variable} font-body overflow-hidden`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={router.asPath}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {getLayout(<Component {...pageProps} />)}
            </motion.div>
          </AnimatePresence>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}