import './bootstrap'
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import '../css/app.css'
import '../css/sb-admin-2-custom.css'
import '../css/crud.css'
// import "../css/card.css" // 🔥 tambahin ini 
// itu kan card.css cuma buat card dashboard doang kan? 
// mending disimpen di Card.jsx, 
// takutnya card lain selain yg dashboard juga kena, 
// nanti malah harus override css-nya
import React from 'react'
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import NProgress from 'nprogress'

createInertiaApp({
  title: title => title ? `${title} - SIWAR` : 'SIWAR',
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    return pages[`./Pages/${name}.jsx`].default
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
// pake spinner 👍
  progress: {
    delay: 250,
    showSpinner: true,
    color: '#4B9CE2',
    includeCSS: true,
  }
})
// install dulu, npm i nprogress
NProgress.configure({
  speed: 1000,
  trickleSpeed: 2000
})