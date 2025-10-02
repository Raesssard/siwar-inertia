import React from "react";
import Layout from "@/Layouts/Layout";
import { StatCard } from "../Component/Card";
import { Head, usePage } from "@inertiajs/react";

export default function DashboardAdmin({
    jumlah_rw,
    jumlah_rt,
    jumlah_golongan,
    jumlah_roles,
    jumlah_permissions,
}) {
    const { props } = usePage()
    const { title } = usePage().props
    const role = props.auth?.currentRole
    return (
        <Layout>
            {/* title di component Head, bukan di Layout */}
            <Head title={`${title} ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`}
            />
            <div className="dashboard-cards">
                <StatCard
                    href="/admin/rw"
                    border="border-left-success"
                    color="text-success"
                    title="Jumlah RW"
                    value={jumlah_rw}
                    icon="fas fa-house-user"
                />
                <StatCard
                    href="/admin/rt"
                    border="border-left-info"
                    color="text-info"
                    title="Jumlah RT"
                    value={jumlah_rt}
                    icon="fas fa-users"
                />
                <StatCard
                    href="/admin/golongan"
                    border="border-left-primary"
                    color="text-primary"
                    title="Jumlah Kategori Golongan"
                    value={jumlah_golongan}
                    icon="fas fa-layer-group"
                />
                <StatCard
                    href="/admin/roles"
                    border="border-left-warning"
                    color="text-warning"
                    title="Jumlah Roles"
                    value={jumlah_roles}
                    icon="fas fa-user-shield"
                />
                <StatCard
                    href="/admin/permissions"
                    border="border-left-danger"
                    color="text-danger"
                    title="Jumlah Permissions"
                    value={jumlah_permissions}
                    icon="fas fa-key"
                />
            </div>
        </Layout>
    );
}
