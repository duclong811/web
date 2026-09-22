import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPerformanceMonitoring } from './utils/analytics'

// Kích hoạt đo lường hiệu năng Website (Core Web Vitals -> Google Analytics)
initPerformanceMonitoring()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
