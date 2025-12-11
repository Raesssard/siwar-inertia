import React, { useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    AddPermissionModal,
    EditPermissionModal,
} from "@/Pages/Component/Modal";
import "../../../css/kk.css"; // biar tampilan seragam

export default function Permission({ permissions, filters, title }) {
    const { props } = usePage();
    const role = props.auth?.currentRole || "Admin";
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({ name: "" });
    const [search, setSearch] = useState({ keyword: filters?.keyword || "" });

    // 🔹 CRUD Handler
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route("admin.permissions.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAdd(false);
                setForm({ name: "" });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        router.put(route("admin.permissions.update", showEdit.id), form, {
            preserveScroll: true,
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus permission ini?")) {
            router.delete(route("admin.permissions.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    const openEdit = (item) => {
        setForm({ name: item.name });
        setShowEdit(item);
    };

    // 🔹 Filter
    const handleSearchChange = (e) =>
        setSearch({ ...search, [e.target.name]: e.target.value });

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

    return (
        <Layout>
            <Head
                title={`${title} - ${role.length <= 2
                    ? role.toUpperCase()
                    : role.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />

            {/* 🔍 Filter Section */}
            <form onSubmit={applyFilter} className="filter-form mb-4 d-flex align-items-center">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Cari permission..."
                    value={search.keyword}
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

            {/* 📋 Table Section */}
            <div className="table-container">
                <div className="table-header d-flex justify-content-between align-items-center">
                    <h4>Manajemen Permissions</h4>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah Permission
                    </button>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="text-center px-3">No.</th>
                                <th className="text-center px-3">Nama Permission</th>
                                <th className="text-center px-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.data.length > 0 ? (
                                permissions.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{permissions.from + index}</td>
                                        <td className="text-center">{item.name}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
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
                </div>

                {/* 🔸 Pagination */}
                {permissions.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {permissions.links.map((link, index) => {
                                let label = link.label
                                if (label.includes("Previous")) label = "&lt;"
                                if (label.includes("Next")) label = "&gt;"

                                return (
                                    <li
                                        key={index}
                                        className={`page-item ${link.active ? "active" : ""} ${!link.url ? "disabled" : ""
                                            }`}
                                        style={{ cursor: !link.url ? "not-allowed" : "pointer" }}
                                    >
                                        <Link
                                            preserveScroll
                                            preserveState
                                            href={link.url || ""}
                                            dangerouslySetInnerHTML={{
                                                __html: label,
                                            }}
                                            title={`Pergi ke halaman ${label === "&lt;" ? 'sebelumnya' : label === "&gt;" ? 'selanjutnya' : label}`}
                                        />
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* 🪟 Modals */}
            {showAdd && (
                <AddPermissionModal
                    form={form}
                    setForm={(name, value) => setForm({ ...form, [name]: value })}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

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
