import React, { useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    AddRoleModal,
    EditRoleModal,
    EditRolePermissionModal,
} from "@/Pages/Component/Modal";
import "../../../css/kk.css"; // biar tabel dan tombol seragam

export default function Roles({ roles, permissions, filters, title }) {
    const { props } = usePage();
    const role = props.auth?.currentRole;

    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);
    const [showPermission, setShowPermission] = useState(null);

    const [form, setForm] = useState({ name: "" });
    const [search, setSearch] = useState({ name: filters?.name || "" });
    const [selectedPerms, setSelectedPerms] = useState([]);

    // --- Handler form ---
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

    const handleEdit = (e) => {
        e.preventDefault();
        router.put(route("admin.roles.update", showEdit.id), form, {
            preserveScroll: true,
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus role ini?")) {
            router.delete(route("admin.roles.destroy", id), { preserveScroll: true });
        }
    };

    // --- Filter & Search ---
    const handleSearchChange = (e) => setSearch({ ...search, [e.target.name]: e.target.value });

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route("admin.roles.index"), search, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetFilter = () => {
        setSearch({ name: "" });
        router.get(route("admin.roles.index"), {}, { replace: true, preserveScroll: true });
    };

    // --- Permission ---
    const togglePermission = (perm) => {
        setSelectedPerms((prev) =>
            prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
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

    const openEdit = (item) => {
        setForm({ name: item.name || "" });
        setShowEdit(item);
    };

    return (
        <Layout>
            <Head
                title={`${title} - ${
                    role.length <= 2
                        ? role.toUpperCase()
                        : role.charAt(0).toUpperCase() + role.slice(1)
                }`}
            />

            {/* 🔹 Filter Section */}
            <form onSubmit={applyFilter} className="filter-form mb-4 d-flex align-items-center">
                <input
                    type="text"
                    name="name"
                    placeholder="Cari nama role..."
                    value={search.name}
                    onChange={handleSearchChange}
                    className="me-2"
                />

                <button type="submit" className="btn-custom btn-secondary me-2">
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

            {/* 🔹 Table Section */}
            <div className="table-container">
                <div className="table-header d-flex justify-content-between align-items-center">
                    <h4>Manajemen Roles</h4>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah Role
                    </button>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="text-center px-3">No.</th>
                                <th className="text-center px-3">Nama Role</th>
                                <th className="text-center px-3">Jumlah Permissions</th>
                                <th className="text-center px-3">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {roles.data.length > 0 ? (
                                roles.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{roles.from + index}</td>
                                        <td className="text-center">{item.name}</td>
                                        <td className="text-center">
                                            {item.permissions.length > 0
                                                ? `${item.permissions.length} permission${
                                                      item.permissions.length > 1 ? "s" : ""
                                                  }`
                                                : "Tidak ada permission"}
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    Edit
                                                </button>

                                                <Link
                                                    href={route("admin.roles.permissions.edit", item.id)}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    Permissions
                                                </Link>

                                                {/* <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Hapus
                                                </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🔹 Pagination */}
                {roles.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {roles.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes("Previous")) label = "&lt;";
                                if (label.includes("Next")) label = "&gt;";

                                return (
                                    <li
                                        key={index}
                                        className={`page-item ${
                                            link.active ? "active" : ""
                                        } ${!link.url ? "disabled" : ""}`}
                                    >
                                        <Link
                                            href={link.url || ""}
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* 🔹 Modal Tambah/Edit/Permission */}
            {showAdd && (
                <AddRoleModal
                    form={form}
                    setForm={setForm}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {showEdit && (
                <EditRoleModal
                    form={form}
                    setForm={setForm}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                />
            )}

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
