import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import App from './App.jsx'

// Suppress benign Recharts ResponsiveContainer layout sizing warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('width') && args[0].includes('height') && args[0].includes('chart')) {
    return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
