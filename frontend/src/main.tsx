import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider as HelmetProviderBase } from 'react-helmet-async'
import { CartProvider } from './context/CartContext'
import './index.css'
import App from './App.tsx'

const HelmetProvider = HelmetProviderBase as unknown as React.ComponentType<React.PropsWithChildren<{}>>

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </HelmetProvider>
  </StrictMode>,
)
