import "../../css/sidebar.css";
import logo from "../../../public/img/logo.png";
import { Link, usePage } from "@inertiajs/react";
import React, { useState } from "react";

export default function Sidebar({ toggleKeParent }) {
    const [toggle, setToggle] = useState("");
    const { url } = usePage();
    const isActive = (url, pattern, exact = false) => {
        if (exact) {
            return url === pattern;
        }
        return url.startsWith(pattern);
    };

    const toggleSidebar = (e) => {
        e.preventDefault();
        const tgl = !toggle ? "toggled" : "";
        setToggle(tgl);
        toggleKeParent(tgl);
    };

    const rotation = toggle ? "right" : "left";

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

                {/* Dashboard */}
                <li
                    className={`nav-item ${
                        isActive(url, "/dashboard", true) ? "active" : ""
                    }`}
                >
                    <Link className="nav-link" href="/dashboard">
                        <i className="fas fa-fw fa-tachometer-alt mr-2"></i>
                        <span>Dashboard</span>
                    </Link>
                </li>

                {/* Master Data Admin */}
                <li
                    className={`nav-item ${
                        isActive(url, "/admin/rw") ? "active" : ""
                    }`}
                >
                    <Link className="nav-link" href="/admin/rw">
                        <i className="fas fa-house-user mr-2"></i>
                        <span>Data RW</span>
                    </Link>
                </li>

                <li
                    className={`nav-item ${
                        isActive(url, "/admin/rt") ? "active" : ""
                    }`}
                >
                    <Link className="nav-link" href="/admin/rt">
                        <i className="fas fa-users mr-2"></i>
                        <span>Data RT</span>
                    </Link>
                </li>

                <li
                    className={`nav-item ${
                        isActive(url, "/admin/kategori-golongan") ? "active" : ""
                    }`}
                >
                    <Link className="nav-link" href="/admin/kategori-golongan">
                        <i className="fas fa-layer-group mr-2"></i>
                        <span>Kategori Golongan</span>
                    </Link>
                </li>

                <li
                    className={`nav-item ${
                        isActive(url, "/admin/roles") ? "active" : ""
                    }`}
                >
                    <Link className="nav-link" href="/admin/roles">
                        <i className="fas fa-user-shield mr-2"></i>
                        <span>Roles</span>
                    </Link>
                </li>

                <li
                    className={`nav-item ${
                        isActive(url, "/admin/permissions") ? "active" : ""
                    }`}
                >
                    <Link className="nav-link" href="/admin/permissions">
                        <i className="fas fa-key mr-2"></i>
                        <span>Permissions</span>
                    </Link>
                </li>

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
    );
}
