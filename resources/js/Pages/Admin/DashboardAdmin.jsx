import React from "react";
import Layout from "@/Layouts/Layout";
import { StatCard } from "../Component/Card";
import { Head, usePage } from "@inertiajs/react";

// ni file udah gk kepake lagi, 
// pakenya Dashboard.jsx doang,
// DashboardControllernya juga cuma render halaman Dashboard.jsx,
// gk render ni halaman
export default function DashboardAdmin({ role, title, ...rest }) {
    const statCards = [
        {
            href: "/admin/rw",
            color: "success",
            title: "Jumlah RW",
            value: rest.jumlah_rw,
            icon: "house-user",
        },
        {
            href: "/admin/rt",
            color: "info",
            title: "Jumlah RT",
            value: rest.jumlah_rt,
            icon: "users",
        },
        {
            href: "/admin/golongan",
            color: "primary",
            title: "Jumlah Kategori Golongan",
            value: rest.jumlah_golongan,
            icon: "layer-group",
        },
        {
            href: "/admin/roles",
            color: "warning",
            title: "Jumlah Roles",
            value: rest.jumlah_roles,
            icon: "user-shield",
        },
        {
            href: "/admin/permissions",
            color: "danger",
            title: "Jumlah Permissions",
            value: rest.jumlah_permissions,
            icon: "key",
        },
    ];

    return (
        <Layout>
            {/* title di component Head, bukan di Layout */}
            <Head title={`${title} ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`}
            />
            <div className="dashboard-cards">
                {statCards.map((card, index) => (
                    <StatCard key={index} {...card} />
                ))}
            </div>
        </Layout>
    );
}
