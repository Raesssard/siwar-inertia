import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import Layout from "@/Layouts/Layout";
import { route } from "ziggy-js";
import { router } from "@inertiajs/react";
import { AddRoleModal as AddPermissionModal, EditRoleModal as EditPermissionModal } from "@/Pages/Component/Modal";

export default function Permission({ permissions, filters }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({
        name: "",
    });

    const [search, setSearch] = useState({
        keyword: filters?.keyword || "",
    });

    // -------------------------------
    // CRUD Handler
    // -------------------------------
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        Inertia.post(route("admin.permissions.store"), form, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({ name: "" });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        Inertia.put(route("admin.permissions.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus permission ini?")) {
            Inertia.delete(route("admin.permissions.destroy", id));
        }
    };

    const openEdit = (permission) => {
        setForm({ name: permission.name });
        setShowEdit(permission);
    };

    // -------------------------------
    // Filter Handler
    // -------------------------------
    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route("admin.permissions.index"), search, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetFilter = () => {
        setSearch({ keyword: "" });
        router.get(route("admin.permissions.index"), {}, {
            replace: true,
            preserveScroll: true,
        });
    };

    // -------------------------------
    // Render
    // -------------------------------
    return (
        <Layout title="Data Permissions">
            {/* Filter */}
            <form onSubmit={applyFilter} className="filter-form">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Cari permission..."
                    value={search.keyword}
                    onChange={handleSearchChange}
                />
                <button type="submit" className="btn-custom btn-secondary ms-2">
                    Filter
                </button>
                <button
                    type="button"
                    onClick={resetFilter}
                    className="btn-custom btn-light bg-gray-300 ms-2"
                >
                    Reset
                </button>
            </form>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Permissions</h4>
                    <button
                        className="btn-custom btn-primary"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah Permission
                    </button>
                </div>

                <table className="table-custom">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Permission</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {permissions.data.length > 0 ? (
                            permissions.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{permissions.from + index}</td>
                                    <td>{item.name}</td>
                                    <td>
                                        <button
                                            className="btn-custom btn-warning me-1"
                                            onClick={() => openEdit(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn-custom btn-danger"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="text-center">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {permissions.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {permissions.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes("Previous")) label = "&lt;";
                                if (label.includes("Next")) label = "&gt;";
                                return (
                                    <li
                                        key={index}
                                        className={`page-item ${link.active ? "active" : ""} ${
                                            !link.url ? "disabled" : ""
                                        }`}
                                    >
                                        <a
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

            {/* Modal Tambah */}
            {showAdd && (
                <AddPermissionModal
                    form={form}
                    setForm={(name, value) => setForm({ ...form, [name]: value })}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {/* Modal Edit */}
            {showEdit && (
                <EditPermissionModal
                    form={form}
                    setForm={(name, value) => setForm({ ...form, [name]: value })}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                />
            )}
        </Layout>
    );
}
