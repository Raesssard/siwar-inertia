import '../../css/sidebar.css'
import logo from '../../../public/img/logo.png'
import { Link, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { SidebarLink } from '../Pages/Component/SidebarLink'
import { getAdminLinks, getRwLinks, getRtLinks, getWargaLinks } from "../Pages/Component/GetPropRole"

export default function Sidebar({ toggleKeParent }) {
    const [toggle, setToggle] = useState("")
    const { url, props } = usePage()
    const role = props.auth?.currentRole

    // ✅ Fungsi cek aktif
    const isActive = (url, pattern, exact = false) => {
        if (exact) return url === pattern
        return url.startsWith(pattern)
    }

    // ✅ Toggle sidebar kiri-kanan
    const toggleSidebar = (e) => {
        e.preventDefault()
        const tgl = !toggle ? "toggled" : ""
        setToggle(tgl)
        toggleKeParent(tgl)
    }

    const rotation = toggle ? 'right' : 'left'
    let statLinks = []

    switch (role) {
        case "admin":
            statLinks = getAdminLinks()
            break
        case "rw":
            statLinks = getRwLinks()
            break
        case "rt":
            statLinks = getRtLinks()
            break
        case "warga":
            statLinks = getWargaLinks()
            break
        default:
            statLinks = []
    }

    return (
        <ul
            className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion d-none d-md-block ${toggle}`}
            id="accordionSidebar"
        >
            {/* Logo */}
            <Link className="sidebar-brand" href="/dashboard">
                <div className="sidebar-brand-icon">
                    <img
                        src={logo}
                        alt="SiWar Logo"
                        className="sidebar-brand-icon-logo"
                    />
                </div>
            </Link>

            <hr className="sidebar-divider my-0" />

            {/* Dynamic links by role */}
            {statLinks.map((link, index) => (
                <SidebarLink key={index} {...link} />
            ))}

            <hr className="sidebar-divider d-none d-md-block" />

            {/* Toggle Button */}
            <div className="text-center">
                <button
                    className="rounded-circle border-0"
                    onClick={toggleSidebar}
                    id="sidebarToggle"
                >
                    <i className={`fas fa-chevron-${rotation} arrow-toggle`}></i>
                </button>
            </div>
        </ul>
    )
}
