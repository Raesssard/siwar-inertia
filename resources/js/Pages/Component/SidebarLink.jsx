import React, { useEffect, useState } from "react"
import { Link, usePage } from "@inertiajs/react"

export function SidebarLink({ href, icon, text, children, isOpen, onToggle }) {
    const { url } = usePage()

    const isActive = (url, pattern, exact = false) => {
        if (exact) {
            return url === pattern
        }
        return url.startsWith(pattern)
    }

    const isAnyChildActive = children?.some((child) => isActive(url, child.href));

    const open = isOpen || isAnyChildActive;

    return (
        <li className={`nav-item ${isActive(url, href) ? 'active' : ''}`}>
            {children ? (
                <>
                    <button
                        className="nav-link d-flex justify-content-between align-items-center w-100 bg-transparent border-0 text-start"
                        onClick={onToggle}
                        type="button"
                    >
                        <span>
                            <i className={`fas fa-${icon} mr-2`}></i>
                            {text}
                        </span>
                        <i className={`fas fa-chevron-${open ? "down" : "right"}`}></i>
                    </button>
                    <ul className={`list-unstyled ps-3 ${open ? "open" : ""}`}>
                        {children.map((child, idx) => (
                            <li key={idx} className={`nav-item m-0 ${isActive(url, child.href) ? "active" : ""}`}>
                                <Link className="nav-link" href={child.href}>
                                    <i className={`fas fa-${child.icon} mr-2`}></i>
                                    {child.text}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <Link className="nav-link" href={href}>
                    <i className={`fas ${href === "/dashboard" ? "fa-fw" : ""} fa-${icon} mr-2`}></i>
                    <span>{text}</span>
                </Link>
            )}
        </li>
    )
}