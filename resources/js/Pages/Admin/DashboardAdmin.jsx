import React from "react";
import Layout from "@/Layouts/Layout";

function StatCard({ href, border, color, title, value, icon }) {
    return (
        <a href={href} className="text-decoration-none">
            <div className={`card ${border} shadow py-2 card-clickable`}>
                <div className="card-body">
                    <div className="row align-items-center">
                        {/* Text */}
                        <div className="col">
                            <div
                                className={`text-xs font-weight-bold ${color} text-uppercase mb-1`}
                            >
                                {title}
                            </div>
                            <div className="h4 mb-0 font-weight-bolder text-gray-800">
                                {value ?? 0}
                            </div>
                        </div>
                        {/* Icon */}
                        <div className="col-auto">
                            <i className={`${icon} fa-3x text-gray-400`}></i>
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}

export default function DashboardAdmin({
    jumlah_rw,
    jumlah_rt,
    jumlah_golongan,
    jumlah_roles,
    jumlah_permissions,
}) {
    return (
        <Layout title="Dashboard Admin">
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
