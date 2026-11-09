import { createRoot } from 'react-dom/client'
import { SmoothScroll } from './components/SmoothScroll'
import App from './App'
import './styles/fontes.css'
import './styles/base.css'
import './styles/cabecalho.css'
import './styles/acesso.css'
import './flow-button.css'

createRoot(document.getElementById('root')).render(
  <SmoothScroll>
    <App />
  </SmoothScroll>,
)
