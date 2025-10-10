import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import Layout from "@/Layouts/Layout";
import {
    AddRoleModal,
    EditRoleModal,
    EditRolePermissionModal,
} from "@/Pages/Component/Modal";

export default function Roles({ roles, permissions, filters, title }) {
    const { props } = usePage()
    const role = props.auth?.currentRole
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);
    const [showPermission, setShowPermission] = useState(null);

    const [form, setForm] = useState({ name: "" });
    const [search, setSearch] = useState({ name: filters?.name || "" });
    const [selectedPerms, setSelectedPerms] = useState([]);

    // 🔹 Handle input form tambah / edit
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Tambah role
    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route("admin.roles.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAdd(false);
                setForm({ name: "" });
            },
        });
    };

    // 🔹 Edit role
    const handleEdit = (e) => {
        e.preventDefault();

        if (!showEdit?.id) {
            alert("ID role tidak ditemukan.");
            return;
        }

        router.put(route("admin.roles.update", showEdit.id), form, {
            preserveScroll: true,
            onSuccess: () => setShowEdit(null),
        });
    };

    // 🔹 Hapus role
    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus role ini?")) {
            router.delete(route("admin.roles.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    // 🔹 Filter nama role
    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route("admin.roles.index"), search, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetFilter = () => {
        setSearch({ name: "" });
        router.get(route("admin.roles.index"), {}, {
            replace: true,
            preserveScroll: true,
        });
    };

    // 🔹 Permissions
    const togglePermission = (perm) => {
        setSelectedPerms((prev) =>
            prev.includes(perm)
                ? prev.filter((p) => p !== perm)
                : [...prev, perm]
        );
    };

    const handlePermissionSave = () => {
        if (!showPermission?.id) return;
        router.put(
            route("admin.roles.permissions.update", showPermission.id),
            { permissions: selectedPerms },
            {
                preserveScroll: true,
                onSuccess: () => setShowPermission(null),
            }
        );
    };

    // 🔹 Buka modal edit
    const openEdit = (role) => {
        setForm({ name: role.name || "" });
        setShowEdit({ id: role.id, name: role.name });
    };

    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            {/* 🔍 Filter */}
            <form onSubmit={applyFilter} className="filter-form mb-3 flex gap-2">
                <input
                    type="text"
                    name="name"
                    value={search.name}
                    onChange={handleSearchChange}
                    className="form-control w-auto"
                    placeholder="Cari nama role..."
                />

                <button type="submit" className="btn-custom btn-secondary">
                    Filter
                </button>
                <button
                    type="button"
                    onClick={resetFilter}
                    className="btn-custom btn-light bg-gray-300"
                >
                    Reset
                </button>
            </form>

            {/* 📋 Tabel Roles */}
            <div className="table-container">
                <div className="table-header flex justify-between items-center mb-3">
                    <h4>Manajemen Roles</h4>
                    <button
                        className="btn-custom btn-primary"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah Role
                    </button>
                </div>

                <table className="table-custom w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Role</th>
                            <th>Permissions</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.data.length > 0 ? (
                            roles.data.map((role, index) => (
                                <tr key={role.id}>
                                    <td>{roles.from + index}</td>
                                    <td>{role.name}</td>
                                    <td>
                                        {role.permissions.length > 0
                                            ? `${role.permissions.length} ${role.permissions.length > 1 ? "permissions" : "permission"}`
                                            : "Tidak ada permission"}
                                    </td>
                                    <td>
                                        <button
                                            className="btn-custom btn-warning me-1"
                                            onClick={() => openEdit(role)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-custom btn-secondary me-1"
                                            onClick={() => {
                                                setShowPermission(role);
                                                setSelectedPerms(role.permissions.map((p) => p.name));
                                            }}
                                        >
                                            Permissions
                                        </button>
                                        <button
                                            className="btn-custom btn-danger"
                                            onClick={() => handleDelete(role.id)}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-3">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* 🔸 Pagination */}
                {roles.links && (
                    <div className="pagination-container mt-3">
                        <ul className="pagination-custom flex gap-2">
                            {roles.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes("Previous")) label = "&lt;";
                                if (label.includes("Next")) label = "&gt;";

                                return (
                                    <li
                                        key={index}
                                        className={`page-item ${link.active ? "active" : ""} ${!link.url ? "disabled" : ""
                                            }`}
                                    >
                                        <Link
                                            href={link.url || "#"}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* ➕ Modal Tambah */}
            {showAdd && (
                <AddRoleModal
                    form={form}
                    setForm={setForm}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {/* ✏️ Modal Edit */}
            {showEdit && (
                <EditRoleModal
                    form={form}
                    setForm={setForm}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                />
            )}

            {/* ⚙️ Modal Permissions */}
            {showPermission && (
                <EditRolePermissionModal
                    role={showPermission}
                    permissions={permissions}
                    selectedPerms={selectedPerms}
                    togglePermission={togglePermission}
                    handleSave={handlePermissionSave}
                    onClose={() => setShowPermission(null)}
                />
            )}
        </Layout>
    );
}
