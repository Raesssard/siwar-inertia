import React from "react";
import { Link, usePage } from "@inertiajs/react";

export function SidebarLink({ href, icon, text }) {
    const { url } = usePage()
    const isActive = (url, pattern, exact = false) => {
        if (exact) {
            return url === pattern
        }
        return url.startsWith(pattern)
    }

    return (
        <li className={`nav-item ${isActive(url, href) ? 'active' : ''}`}>
            <Link className="nav-link" href={href}>
                <i className={`fas ${href === "/dashboard" ? "fa-fw" : ""} fa-${icon} mr-2`}></i>
                <span>{text}</span>
            </Link>
        </li>
    )
}