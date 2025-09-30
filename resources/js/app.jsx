import './bootstrap'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../css/app.css'
import '../css/sb-admin-2-custom.css'
import '../css/table.css'
import '../css/card.css'   // 🔥 tambahin ini
import React from 'react'
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'

createInertiaApp({
  title: title => title ? `${title} - SIWAR` : 'SIWAR',
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`].default
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
