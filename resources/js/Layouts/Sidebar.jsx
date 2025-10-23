import '../../css/sidebar.css'
import logo from '../../../public/img/logo.png'
import { Link, usePage } from "@inertiajs/react"
import React, { useEffect, useState } from "react"
import { SidebarLink } from '../Pages/Component/SidebarLink'
import { getAdminLinks, getRwLinks, getRtLinks, getWargaLinks } from "../Pages/Component/GetPropRole"

export default function Sidebar({ toggleKeParent, localStorageHistory }) {
    const [toggle, setToggle] = useState("")
    const [openMenus, setOpenMenus] = useState(() => {
        const saved = localStorage.getItem("openMenus");
        return saved ? JSON.parse(saved) : {};
    })

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => {
            const updated = { ...prev, [menuName]: !prev[menuName] };
            localStorage.setItem("openMenus", JSON.stringify(updated));
            return updated;
        })
    }
    const { props } = usePage()
    const role = props.auth?.currentRole

    useEffect(() => {
        localStorage.setItem("openMenus", JSON.stringify(openMenus));
    }, [openMenus]);

    useEffect(() => {
        if (localStorageHistory) {
            localStorage.removeItem("openMenus");
            setOpenMenus({});
        }
    }, [localStorageHistory]);

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
        <>
            <ul
                className={`navbar-nav bg-gradient-primary sidebar sidebar-dark accordion d-none d-md-block ${toggle}`}
                id="accordionSidebar"
            >
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

                {statLinks.map((link, index) => (
                    <SidebarLink
                        key={index}
                        {...link}
                        isOpen={!!openMenus[link.text]}
                        onToggle={() => toggleMenu(link.text)}
                    />
                ))}

                <hr className="sidebar-divider d-none d-md-block" />

                <div className="text-center">
                    <button
                        className="rounded-circle border-0"
                        onClick={toggleSidebar}
                        id="sidebarToggle"
                    >
                        <i
                            className={`fas fa-chevron-${rotation} arrow-toggle`}
                        ></i>
                    </button>
                </div>
            </ul>
        </>
    )
}
