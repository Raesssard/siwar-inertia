import React, { useEffect, useState } from "react"
import { Link, usePage } from "@inertiajs/react"

export function SidebarLink({ href, icon, text, children, isOpen, onToggle, isToggleOrMobile }) {
    const { url } = usePage()

    const isActive = (url, pattern, exact = false) => {
        if (exact) {
            return url === pattern
        }
        return url.startsWith(pattern)
    }

    const open = isOpen;

    const sizeFont = isToggleOrMobile ? '0.55rem' : '0.75rem';

    return (
        <li className={`nav-item m-0 ${isActive(url, href) ? 'active' : ''}`}>
            {children ? (
                <>
                    <button
                        className="nav-link d-flex justify-content-between align-items-center w-100 bg-transparent border-0 text-start"
                        onClick={onToggle}
                        type="button"
                    >
                        <div className="w-100">
                            <i className={`fas fa-${icon} me-2`}></i>
                            <span>
                                {text}
                            </span>
                        </div>
                        <i className={`fas fa-chevron-${open ? "down" : "right"}`} style={{
                            position: 'absolute',
                            right: '0.75rem',
                            zIndex: 10,
                        }}></i>
                    </button>
                    <ul className={`list-unstyled ${isToggleOrMobile ? '' : 'ps-3'} ${open ? "open" : ""}`}>
                        {children.map((child, idx) => (
                            <li key={idx} className={`nav-item m-0 ${isActive(url, child.href) ? "active" : ""}`}>
                                <Link className="nav-link" href={child.href}>
                                    <i className={`fas fa-${child.icon} me-2`}></i>
                                    <span style={{ fontSize: sizeFont }}>{child.text}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <Link className="nav-link " href={href}>
                    <i className={`fas ${href === "/dashboard" ? "fa-fw" : ""} fa-${icon}`}></i>
                    <span>{text}</span>
                </Link>
            )}
        </li>
    )
}