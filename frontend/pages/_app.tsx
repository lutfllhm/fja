import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Form Jobs Application - CV. Rajawali Bina Maju</title>
      </Head>
      <Component {...pageProps} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1D23',
            color: '#fff',
            borderLeft: '3px solid #E2231A',
            borderRadius: '12px',
            fontSize: '13px',
            padding: '12px 18px',
          },
          error: {
            style: {
              background: '#7F1D1D',
              borderLeft: '3px solid #FCA5A5',
            },
          },
        }}
      />
    </>
  );
}
