import './assets/main.css'
import './i18n/config' // Inicializar i18n
import ReactDOM from 'react-dom/client'
import App from './App'

// Renderizamos sin StrictMode para evitar doble inicialización de la DB
// En producción esto no afecta, solo en desarrollo
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
