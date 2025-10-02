// resources/js/Pages/Admin/Rw.jsx
import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import Layout from "@/Layouts/Layout";
import { AddRwModal, EditRwModal } from "@/Pages/Component/Modal";

export default function Rw({ rw, filters }) {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({
        nik: "",
        nomor_rw: "",
        nama_ketua_rw: "",
        mulai_menjabat: "",
        akhir_jabatan: "",
    });

    const [search, setSearch] = useState({
        keyword: filters?.keyword || "",
        nomor_rw: filters?.nomor_rw || "",
    });

    // --- handlers form RW ---
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        Inertia.post(route("admin.rw.store"), form, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({
                    nik: "",
                    nomor_rw: "",
                    nama_ketua_rw: "",
                    mulai_menjabat: "",
                    akhir_jabatan: "",
                });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        Inertia.put(route("admin.rw.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus data RW ini?")) {
            Inertia.delete(route("admin.rw.destroy", id));
        }
    };

    const openEdit = (rwItem) => {
        setForm({
            nik: rwItem.nik || "",
            nomor_rw: rwItem.nomor_rw || "",
            nama_ketua_rw: rwItem.nama_ketua_rw || "",
            mulai_menjabat: rwItem.mulai_menjabat || "",
            akhir_jabatan: rwItem.akhir_jabatan || "",
        });
        setShowEdit(rwItem);
    };

    // --- handlers filter ---
    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const applyFilter = (e) => {
        e.preventDefault();
        Inertia.get(route("admin.rw.index"), search, { preserveState: true });
    };

    return (
        <Layout title="Data RW">
            {/* Filter */}
            <form onSubmit={applyFilter} className="filter-form">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Cari NIK atau Nama Ketua RW..."
                    value={search.keyword}
                    onChange={handleSearchChange}
                />
                <input
                    type="text"
                    name="nomor_rw"
                    placeholder="Cari Nomor RW..."
                    value={search.nomor_rw}
                    onChange={handleSearchChange}
                />
                <button type="submit" className="btn-custom btn-secondary">
                    Filter
                </button>
            </form>

            {/* Table */}
            <div className="table-container">
                <div className="table-header">
                    <h4>Data RW</h4>
                    <button
                        className="btn-custom btn-primary"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah RW
                    </button>
                </div>

                <table className="table-custom">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>NIK</th>
                            <th>Nomor RW</th>
                            <th>Nama Ketua RW</th>
                            <th>Mulai Menjabat</th>
                            <th>Akhir Jabatan</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rw.data.length > 0 ? (
                            rw.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{rw.from + index}</td>
                                    <td>{item.nik}</td>
                                    <td>{item.nomor_rw}</td>
                                    <td>{item.nama_ketua_rw}</td>
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
                {rw.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {rw.links.map((link, index) => {
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
                <AddRwModal
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                />
            )}

            {/* Modal Edit */}
            {showEdit && (
                <EditRwModal
                    form={form}
                    handleChange={handleChange}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                />
            )}
        </Layout>
    );
}
