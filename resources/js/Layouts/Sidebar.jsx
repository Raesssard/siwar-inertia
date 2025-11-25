import '../../css/sidebar.css'
import logo from '../../../public/img/logo.png'
import { Link, usePage } from "@inertiajs/react"
import React, { useEffect, useState } from "react"
import { SidebarLink } from '../Pages/Component/SidebarLink'
import { getAdminLinks, getRwLinks, getRtLinks, getWargaLinks } from "../Pages/Component/GetPropRole"

export default function Sidebar({ toggleKeParent, localStorageHistory }) {
    const [toggle, setToggle] = useState(() => {
        return localStorage.getItem("sidebarCollapsed") === "true" ? "toggled" : ""
    })
    const [openMenus, setOpenMenus] = useState(() => {
        const saved = localStorage.getItem("openMenus")
        return saved ? JSON.parse(saved) : {}
    })

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => {
            const updated = { ...prev, [menuName]: !prev[menuName] }
            localStorage.setItem("openMenus", JSON.stringify(updated))
            return updated
        })
    }

    const { props } = usePage()
    const role = props.auth?.currentRole
    const sideRoles = props.auth?.sideRoles || []
    const permissions = props.auth?.permissions || []

    useEffect(() => {
        localStorage.setItem("openMenus", JSON.stringify(openMenus))
    }, [openMenus])

    useEffect(() => {
        if (localStorageHistory) {
            localStorage.removeItem("openMenus")
            localStorage.removeItem("sidebarCollapsed")
            setOpenMenus({})
            setToggle("")
        }
    }, [localStorageHistory])

    const toggleSidebar = (e) => {
        e.preventDefault()
        const newToggle = toggle === "" ? "toggled" : ""

        setToggle(newToggle)
        toggleKeParent(newToggle)

        localStorage.setItem("sidebarCollapsed", newToggle === "toggled")

        if (!toggle) {
            localStorage.removeItem("openMenus")
            setOpenMenus({})
        }
    }

    const rotation = toggle === "toggled" ? "right" : "left"
    let statLinks = []

    // 🔹 Ambil menu sesuai role
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

    const mainRoles = ["admin", "rw", "rt", "warga"]
    const activeRole = sideRoles.length > 0 ? sideRoles[0] : role

    const filteredLinks = statLinks.flatMap(link => {

        // 1) DASHBOARD selalu muncul
        if (link.href === "/dashboard") {
            return [{
                text: link.text,
                href: link.href,
                icon: link.icon
            }]
        }

        const parentAllowed =
            !link.permission || permissions.includes(link.permission)

        const childrenAllowed = link.children
            ? link.children.filter(child =>
                !child.permission || permissions.includes(child.permission)
            )
            : []

        // 2) ROLE UTAMA → masih ada ortu, anaknya masih kecil
        if (mainRoles.includes(activeRole)) {
            if (parentAllowed || childrenAllowed.length > 0) {
                if (childrenAllowed.length > 0) {
                    return [{
                        ...link,
                        children: childrenAllowed
                    }]
                }

                const { children, ...rest } = link
                return [rest]
            }
            return []
        }

        // 3) ROLE SAMPINGAN → ortu dh pergi, anaknya udah gede
        if (!mainRoles.includes(activeRole)) {
            return childrenAllowed.map(child => {
                const { children, ...rest } = child  // 🔥 anaknya dh mandiri
                return rest
            })
        }

        return []
    })


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

                {filteredLinks.map((link, index) => (
                    <SidebarLink
                        key={index}
                        {...link}
                        isOpen={!!openMenus[link.text]}
                        onToggle={() => toggleMenu(link.text)}
                        isToggleOrMobile={toggle !== ""}
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
