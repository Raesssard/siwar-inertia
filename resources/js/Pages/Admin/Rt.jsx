// resources/js/Pages/Admin/Rt.jsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from "ziggy-js";
import Layout from "@/Layouts/Layout";
import { AddRtModal, EditRtModal } from "@/Pages/Component/Modal";

export default function Rt({ rukun_tetangga, filters, nomorRtList }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({
        nik: "",
        nomor_rt: "",
        nama_ketua_rt: "",
        mulai_menjabat: "",
        akhir_jabatan: "",
    });

    const [search, setSearch] = useState({
        keyword: filters?.keyword || "",
        nomor_rt: filters?.nomor_rt || "",
    });

    // --- handlers form RT ---
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        router.post(route("admin.rt.store"), form, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({
                    nik: "",
                    nomor_rt: "",
                    nama_ketua_rt: "",
                    mulai_menjabat: "",
                    akhir_jabatan: "",
                });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        router.put(route("admin.rt.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus data RT ini?")) {
            router.delete(route("admin.rt.destroy", id));
        }
    };

    const openEdit = (rtItem) => {
        setForm({
            nik: rtItem.nik || "",
            nomor_rt: rtItem.nomor_rt || "",
            nama_ketua_rt: rtItem.nama_ketua_rt || "",
            mulai_menjabat: rtItem.mulai_menjabat || "",
            akhir_jabatan: rtItem.akhir_jabatan || "",
        });
        setShowEdit(rtItem);
    };

    // --- handlers filter ---
    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route("admin.rt.index"), search, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetFilter = () => {
        setSearch({
            keyword: "",
            nomor_rt: "",
        });
        router.get(route("admin.rt.index"), {}, {
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <Layout title="Data RT">
            {/* Filter */}
            <form onSubmit={applyFilter} className="filter-form">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Cari NIK atau Nama Ketua RT..."
                    value={search.keyword}
                    onChange={handleSearchChange}
                />

                <select
                    name="nomor_rt"
                    value={search.nomor_rt}
                    onChange={handleSearchChange}
                >
                    <option value="">-- Semua Nomor RT --</option>
                    {nomorRtList.map((rt) => (
                        <option key={rt} value={rt}>
                            RT {rt}
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
                    <h4>Data RT</h4>
                    <button
                        className="btn-custom btn-primary"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah RT
                    </button>
                </div>

                <table className="table-custom">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>NIK</th>
                            <th>Nomor RT</th>
                            <th>Nama Ketua RT</th>
                            <th>Mulai Menjabat</th>
                            <th>Akhir Jabatan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rukun_tetangga.data.length > 0 ? (
                            rukun_tetangga.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{rukun_tetangga.from + index}</td>
                                    <td>{item.nik}</td>
                                    <td>{item.nomor_rt}</td>
                                    <td>{item.nama_ketua_rt}</td>
                                    <td>{item.mulai_menjabat}</td>
                                    <td>{item.akhir_jabatan}</td>
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
                                <td colSpan="7" className="text-center">
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {rukun_tetangga.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {rukun_tetangga.links.map((link, index) => {
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
                                            dangerouslySetInnerHTML={{
                                                __html: label,
                                            }}
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
                <AddRtModal
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {/* Modal Edit */}
            {showEdit && (
                <EditRtModal
                    form={form}
                    handleChange={handleChange}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                />
            )}
        </Layout>
    );
}
