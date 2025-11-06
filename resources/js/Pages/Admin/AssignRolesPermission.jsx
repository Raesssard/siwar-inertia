import React, { useState, useMemo } from "react";
import Layout from "@/Layouts/Layout";
import { Head, router, Link } from "@inertiajs/react";
import { route } from "ziggy-js";

export default function AssignRolesPermission({ role, permissions, title }) {
    const [selectedPerms, setSelectedPerms] = useState(
        role.permissions.map((p) => p.name)
    );
    const [search, setSearch] = useState("");

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
                onSuccess: () => alert("✅ Permission berhasil diperbarui!"),
            }
        );
    };

    // 🧠 Grouping permission berdasarkan prefix
    const groupedPermissions = useMemo(() => {
        const groups = {};

        permissions.forEach((perm) => {
            const prefix = perm.name.split(".")[0]; // contoh: create.user → "create"
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(perm);
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

    return (
        <Layout>
            <Head title={title} />

            {/* 🧩 Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-semibold mb-0">
                    <i className="fas fa-lock text-primary me-2"></i>
                    Atur Permissions untuk Role:
                    <span className="text-success ms-2">{role.name}</span>
                </h3>
            </div>



            {/* 🧱 Grid grouped permissions */}
            <div
                className="bg-white shadow-sm rounded p-4"
                style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
                {Object.keys(filteredGroups).length > 0 ? (
                    Object.entries(filteredGroups).map(([group, perms]) => (
                        <div key={group} className="mb-4">
                            {/* 🔹 Nama Group */}
                            <h5 className="fw-bold text-primary text-uppercase border-bottom pb-2 mb-3">
                                <i className="fas fa-folder-open me-2"></i>
                                {group}
                            </h5>

                            {/* 🔸 Daftar Permission */}
                            <div className="row g-3">
                                {perms.map((perm) => (
                                    <div
                                        key={perm.id}
                                        className="col-12 col-sm-6 col-md-4 col-lg-3"
                                    >
                                        <label
                                            className={`d-flex align-items-center p-2 rounded border transition text-black ${
                                                selectedPerms.includes(perm.name)
                                                    ? "bg-blue-500 bg-opacity-10 border-blue-950"
                                                    : "bg-light border-light"
                                            }`}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPerms.includes(
                                                    perm.name
                                                )}
                                                onChange={() =>
                                                    togglePermission(perm.name)
                                                }
                                                className="form-check-input me-2"
                                            />
                                            <span className="text-truncate">
                                                {perm.name}
                                            </span>
                                        </label>
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
            <div className="d-flex justify-content-end gap-2 mt-4">
                <button className="btn btn-primary px-4" onClick={handleSave}>
                    <i className="fas fa-save me-1"></i> Simpan Perubahan
                </button>
                <Link
                    href={route("admin.roles.index")}
                    className="btn btn-outline-secondary px-4"
                >
                    <i className="fas fa-arrow-left me-1"></i> Kembali
                </Link>
            </div>
        </Layout>
    );
}
