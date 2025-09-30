import '../../css/sidebar.css'
import logo from '../../../public/img/logo.png'
import { Link, usePage } from "@inertiajs/react"
import React, { useState } from "react"

export default function Sidebar({ toggleKeParent }) {
    const [toggle, setToggle] = useState("")
    const { auth } = usePage().props
    const { url } = usePage()
    const isActive = (url, pattern, exact = false) => {
        if (exact) {
            return url === pattern
        }
        return url.startsWith(pattern)
    }


    const toggleSidebar = (e) => {
        e.preventDefault()
        const tgl = !toggle ? "toggled" : ""

        setToggle(tgl)
        toggleKeParent(tgl)
    }

    const rotation = toggle ? 'right' : 'left'

    return (
        <>
            <ul className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion d-none d-md-block ${toggle}`} id="accordionSidebar">

                <Link className="sidebar-brand" href="/dashboard">
                    <div className="sidebar-brand-icon">
                        <img src={logo} alt="SiWar Logo" className="sidebar-brand-icon-logo" />
                    </div>
                </Link>

                <hr className="sidebar-divider my-0" />

                <li className={`nav-item ${isActive(url, '/dashboard', true) ? 'active' : ''}`}>
                    <Link className="nav-link" href="/dashboard">
                        <i className="fas fa-fw fa-tachometer-alt mr-2"></i>
                        <span>Dashboard</span>
                    </Link>
                </li>


                <li className={`nav-item ${isActive(url, '/warga/pengumuman') ? 'active' : ''}`}>
                    <Link className="nav-link" href="/warga/pengumuman">
                        <i className="fas fa-bullhorn mr-2"></i>
                        <span>Pengumuman</span>
                    </Link>
                </li>

                <li className={`nav-item ${isActive(url, '/warga/pengaduan') ? 'active' : ''}`}>
                    <Link className="nav-link" href="/warga/pengaduan">
                        <i className="fas fa-paper-plane mr-2"></i>
                        <span>Pengaduan</span>
                    </Link>
                </li>

                <li className={`nav-item ${isActive(url, '/warga/kk') ? 'active' : ''}`}>
                    <Link className="nav-link" href="/warga/kk">
                        <i className="fas fa-id-card mr-2"></i>
                        <span>Lihat KK</span>
                    </Link>
                </li>
                <li className={`nav-item ${isActive(url, '/warga/tagihan') ? 'active' : ''}`}>
                    <Link className="nav-link" href="/warga/tagihan">
                        <i className="fas fa-hand-holding-usd mr-2"></i>
                        <span>Lihat Tagihan</span>
                    </Link>
                </li>
                <li className={`nav-item ${isActive(url, '/warga/transaksi') ? 'active' : ''}`}>
                    <Link className="nav-link" href="/warga/transaksi">
                        <i className="fas fa-money-bill-wave mr-2"></i>
                        <span>Lihat Transaksi</span>
                    </Link>
                </li>

                <hr className="sidebar-divider d-none d-md-block" />

                <div className="text-center">
                    <button className="rounded-circle border-0" onClick={toggleSidebar} id="sidebarToggle">
                        <i className={`fas fa-chevron-${rotation} arrow-toggle`}></i>
                    </button>
                </div>

            </ul>
        </>
    )
}