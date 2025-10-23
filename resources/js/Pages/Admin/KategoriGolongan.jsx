import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import Layout from "@/Layouts/Layout";
import {
    AddKategoriGolonganModal,
    EditKategoriGolonganModal,
} from "@/Pages/Component/Modal";

export default function KategoriGolongan({ kategori, filters, title }) {
    const { props } = usePage()
    const role = props.auth?.currentRole
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({ jenis: "" });
    const [search, setSearch] = useState({ jenis: filters?.jenis || "" });

    // 🔹 Handle perubahan input form tambah/edit
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // 🔹 Tambah kategori baru
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

    // 🔹 Edit kategori
    const handleEdit = (e) => {
        e.preventDefault();

        if (!showEdit?.id) {
            alert("ID kategori tidak ditemukan.");
            return;
        }

        router.put(
            route("admin.kategori-golongan.update", showEdit.id),
            form,
            {
                preserveScroll: true,
                onSuccess: () => setShowEdit(null),
            }
        );
    };

    // 🔹 Hapus kategori
    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus kategori golongan ini?")) {
            router.delete(route("admin.kategori-golongan.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    // 🔹 Buka modal edit
    const openEdit = (item) => {
        setForm({ jenis: item.jenis || "" });
        setShowEdit({ id: item.id, jenis: item.jenis });
    };

    // 🔹 Filter pencarian teks
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
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            {/* 🔍 Filter pencarian */}
            <form onSubmit={applyFilter} className="filter-form mb-3 flex gap-2">
                <input
                    type="text"
                    name="jenis"
                    placeholder="Cari jenis golongan..."
                    value={search.jenis}
                    onChange={handleSearchChange}
                    className="form-control w-auto"
                />
                <button type="submit" className="btn-custom btn-secondary">
                    Cari
                </button>
                <button
                    type="button"
                    onClick={resetFilter}
                    className="btn-custom btn-light bg-gray-300"
                >
                    Reset
                </button>
            </form>

            {/* 📋 Tabel Kategori */}
            <div className="table-container">
                <div className="table-header flex justify-between items-center mb-3">
                    <h4>Kategori Golongan</h4>
                    <button
                        className="btn-custom btn-primary"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah Kategori
                    </button>
                </div>

                <table className="table-custom w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="text-center">No</th>
                            <th className="text-center">Jenis</th>
                            <th className="text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {kategori.data.length > 0 ? (
                            kategori.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="text-center">{kategori.from + index}</td>
                                    <td className="text-center">{item.jenis}</td>
                                    <td className="text-center">
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
                                <td colSpan="3" className="text-center py-3">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* 🔸 Pagination */}
                {kategori.links && (
                    <div className="pagination-container mt-3">
                        <ul className="pagination-custom flex gap-2">
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

            {/* ➕ Modal Tambah */}
            {showAdd && (
                <AddKategoriGolonganModal
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {/* ✏️ Modal Edit */}
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
