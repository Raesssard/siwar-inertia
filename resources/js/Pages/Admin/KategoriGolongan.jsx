import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import Layout from "@/Layouts/Layout";
import {
    AddKategoriGolonganModal,
    EditKategoriGolonganModal,
} from "@/Pages/Component/Modal";

export default function KategoriGolongan({ kategori, filters, jenisList }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({
        jenis: "",
    });

    const [search, setSearch] = useState({
        jenis: filters?.jenis || "",
    });

    // --- form handlers ---
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route("admin.kategori-golongan.store"), form, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({ jenis: "" });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        router.put(route("admin.kategori-golongan.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus kategori golongan ini?")) {
            router.delete(route("admin.kategori-golongan.destroy", id));
        }
    };

    const openEdit = (item) => {
        setForm({
            jenis: item.jenis || "",
        });
        setShowEdit(item);
    };

    // --- filter handlers ---
    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

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
        <Layout title="Kategori Golongan">
            {/* Filter */}
            <form onSubmit={applyFilter} className="filter-form">
                <select
                    name="jenis"
                    value={search.jenis}
                    onChange={handleSearchChange}
                >
                    <option value="">-- Semua Jenis --</option>
                    {jenisList.map((j) => (
                        <option key={j} value={j}>
                            {j.charAt(0).toUpperCase() + j.slice(1)}
                        </option>
                    ))}
                </select>

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

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <h4>Kategori Golongan</h4>
                    <button
                        className="btn-custom btn-primary"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah Kategori
                    </button>
                </div>

                <table className="table-custom">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Jenis</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kategori.data.length > 0 ? (
                            kategori.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{kategori.from + index}</td>
                                    <td>{item.jenis}</td>
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
                <AddKategoriGolonganModal
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {/* Modal Edit */}
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
