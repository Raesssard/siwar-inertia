import React, { useState, useMemo } from "react";
import Layout from "@/Layouts/Layout";
import { Head, router, Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { iconPermission } from "../Component/GetPropRole";

export default function AssignRolesPermission({ role, permissions, title }) {
    const [selectedPerms, setSelectedPerms] = useState(
        role.permissions.map((p) => p.name)
    );
    const [search, setSearch] = useState("");
    const { props } = usePage()
    const currentRole = props.auth?.currentRole ?? []

    // 🔄 Toggle permission
    const togglePermission = (perm) => {
        setSelectedPerms((prev) =>
            prev.includes(perm)
                ? prev.filter((p) => p !== perm)
                : [...prev, perm]
        );
    };

    // 💾 Simpan perubahan
    const handleSave = () => {
        router.put(
            route("admin.roles.permissions.update", role.id),
            { permissions: selectedPerms },
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit(route("admin.roles.index")); // ⬅️ kembali ke halaman daftar role
                },
                onError: () => alert("❌ Gagal memperbarui permission!"),
            }
        );
    };

    // 🧠 Grouping permission berdasarkan prefix
    const groupedPermissions = useMemo(() => {
        const groups = {};

        permissions.forEach((perm) => {
            const prefix = perm.name.split(".")[0]; // contoh: create.user → "create"
            const iconP = iconPermission().map((iPer) => ({
                iconName: iPer.name,
                iconLogo: iPer.icon,
            }))
            const match = iconP.find(i => i.iconName === prefix)
            const iconMatchName = match ? match.iconLogo : null
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push({ ...perm, icon: iconMatchName });
        });

        return groups;
    }, [permissions]);

    // 🔍 Filter permission berdasarkan pencarian
    const filteredGroups = useMemo(() => {
        if (!search) return groupedPermissions;
        const result = {};
        Object.entries(groupedPermissions).forEach(([group, perms]) => {
            const filtered = perms.filter((p) =>
                p.name.toLowerCase().includes(search.toLowerCase())
            );
            if (filtered.length > 0) result[group] = filtered;
        });

        return result;
    }, [search, groupedPermissions]);

    // console.log(groupedPermissions)
    // console.log(filteredGroups)
    return (
        <Layout>
            <Head
                title={`${title} - ${currentRole.length <= 2
                    ? currentRole.toUpperCase()
                    : currentRole.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />




            {/* 🧱 Grid grouped permissions */}
            <div
                className="bg-white shadow-sm rounded p-4"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
                {/* 🧩 Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-semibold">
                        <i className="fas fa-lock text-primary me-2"></i>
                        Atur Permissions untuk Role:
                        <span className="text-success ms-2">{role.name.length <= 2
                            ? role.name.toUpperCase()
                            : role.name.replace(/\b\w/g, (char) => char.toUpperCase())}</span>
                    </h3>
                </div>
                {Object.keys(filteredGroups).length > 0 ? (
                    Object.entries(filteredGroups).map(([group, perms]) => (
                        <div key={group} className="mb-4">
                            {/* 🔹 Nama Group */}
                            <h5 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
                                <i className={`fas fa-${perms[0].icon} me-2`}></i>
                                {group}
                            </h5>

                            {/* 🔸 Daftar Permission */}
                            <div className="row g-3">
                                {perms.map((perm) => (
                                    <div
                                        key={perm.id}
                                        className="col-12 col-sm-6 col-md-4 col-lg-3"
                                    >
                                        <div
                                            className="d-flex align-items-center p-2 rounded transition text-black mb-2"
                                            style={selectedPerms.includes(perm.name)
                                                ? {
                                                    cursor: "pointer",
                                                    border: "0.15rem solid #4e73df",
                                                } : {
                                                    cursor: "pointer",
                                                    border: "0.15rem solid lightgray",
                                                }
                                            }
                                            onClick={() => document.getElementById('checkPermission').click()}
                                        >
                                            <span className="">
                                                {perm.name}
                                            </span>
                                            <input
                                                id="checkPermission"
                                                type="checkbox"
                                                checked={selectedPerms.includes(
                                                    perm.name
                                                )}
                                                onChange={() =>
                                                    togglePermission(perm.name)
                                                }
                                                className="ml-auto"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted py-4">
                        Tidak ada permission ditemukan.
                    </div>
                )}
            </div>

            {/* 🔘 Tombol Aksi */}
            <div className="d-flex w-100 justify-content-end gap-2 mt-4 me-4">
                <button className="btn btn-primary px-4" onClick={handleSave}>
                    <i className="fas fa-save me-1"></i> Simpan Perubahan
                </button>
                <Link
                    preserveScroll
                    preserveState
                    href={route("admin.roles.index")}
                    className="btn btn-outline-secondary px-4"
                >
                    <i className="fas fa-arrow-left me-1"></i> Kembali
                </Link>
            </div>
        </Layout>
    );
}
