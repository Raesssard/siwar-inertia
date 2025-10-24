import React, { useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import {
    AddKategoriGolonganModal,
    EditKategoriGolonganModal,
} from "@/Pages/Component/Modal";
import "../../../css/kk.css";

export default function KategoriGolongan({ kategori, filters, title }) {
    const { props } = usePage();
    const role = props.auth?.currentRole || "Admin";
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);
    const [form, setForm] = useState({ jenis: "" });
    const [search, setSearch] = useState({ jenis: filters?.jenis || "" });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route("admin.kategori-golongan.store"), form, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAdd(false);
                setForm({ jenis: "" });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        if (!showEdit?.id) return alert("ID kategori tidak ditemukan.");
        router.put(route("admin.kategori-golongan.update", showEdit.id), form, {
            preserveScroll: true,
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus kategori ini?")) {
            router.delete(route("admin.kategori-golongan.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    const openEdit = (item) => {
        setForm({ jenis: item.jenis });
        setShowEdit(item);
    };

    const handleSearchChange = (e) =>
        setSearch({ ...search, [e.target.name]: e.target.value });

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route("admin.kategori-golongan.index"), search, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetFilter = () => {
        setSearch({ jenis: "" });
        router.get(route("admin.kategori-golongan.index"), {}, {
            replace: true,
            preserveScroll: true,
        });
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

            {/* 🔍 Filter */}
            <form onSubmit={applyFilter} className="filter-form mb-4 d-flex align-items-center">
                <input
                    type="text"
                    name="jenis"
                    placeholder="Cari jenis golongan..."
                    value={search.jenis}
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
                    <h4>Manajemen Kategori Golongan</h4>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah Kategori
                    </button>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="text-center px-3">No.</th>
                                <th className="text-center px-3">Jenis Golongan</th>
                                <th className="text-center px-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kategori.data.length > 0 ? (
                                kategori.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{kategori.from + index}</td>
                                        <td className="text-center">{item.jenis}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-warning btn-sm"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    Hapus
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
                {kategori.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {kategori.links.map((link, index) => {
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

            {/* 🪟 Modals */}
            {showAdd && (
                <AddKategoriGolonganModal
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {showEdit && (
                <EditKategoriGolonganModal
                    form={form}
                    handleChange={handleChange}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                />
            )}
        </Layout>
    );
}
