// resources/js/Pages/Admin/Rw.jsx
import React, { useState } from "react";
import Layout from "@/Layouts/Layout";
import { route } from "ziggy-js";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { AddRwModal, EditRwModal } from "@/Pages/Component/Modal";

export default function Rw({ rw, filters, nomorRwList, title }) {
    const { props } = usePage()
    const role = props.auth?.currentRole
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({
        nik: "",
        nomor_rw: "",
        nama_anggota_rw: "",
        mulai_menjabat: "",
        akhir_jabatan: "",
        status: "aktif",
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
        router.post(route("admin.rw.store"), form, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({
                    nik: "",
                    nomor_rw: "",
                    nama_anggota_rw: "",
                    mulai_menjabat: "",
                    akhir_jabatan: "",
                    status: "aktif",
                });
            },
        });
    };

    const handleEdit = (e) => {
        e.preventDefault();
        router.put(route("admin.rw.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        });
    };

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus data RW ini?")) {
            router.delete(route("admin.rw.destroy", id));
        }
    };

    // 🔹 Toggle status aktif / nonaktif
    const handleToggleStatus = (id) => {
        if (confirm("Yakin ingin mengubah status RW ini?")) {
            router.put(route("admin.rw.toggleStatus", id), {}, {
                preserveScroll: true,
            });
        }
    };

    const openEdit = (rwItem) => {
        setForm({
            nik: rwItem.nik || "",
            nomor_rw: rwItem.nomor_rw || "",
            nama_anggota_rw: rwItem.nama_anggota_rw || "",
            mulai_menjabat: rwItem.mulai_menjabat || "",
            akhir_jabatan: rwItem.akhir_jabatan || "",
            status: rwItem.status || "aktif",
        });
        setShowEdit(rwItem);
    };

    // --- handlers filter ---
    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value });
    };

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route("admin.rw.index"), search, {
            replace: true,
            preserveScroll: true,
        });
    };

    const resetFilter = () => {
        setSearch({
            keyword: "",
            nomor_rw: "",
        });
        router.get(route("admin.rw.index"), {}, {
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <Layout title="Data RW">
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            {/* Filter */}
            <form onSubmit={applyFilter} className="filter-form">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Cari NIK atau Nama Ketua RW..."
                    value={search.keyword}
                    onChange={handleSearchChange}
                />

                <select
                    name="nomor_rw"
                    value={search.nomor_rw}
                    onChange={handleSearchChange}
                    className="ms-2"
                >
                    <option value="">-- Semua Nomor RW --</option>
                    {nomorRwList.map((rwItem, index) => (
                        <option key={index} value={rwItem.nomor_rw}>
                            RW {rwItem.nomor_rw}
                        </option>
                    ))}
                </select>

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
                            <th>Status</th>
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
                                    <td>{item.nama_anggota_rw}</td>
                                    <td>{item.mulai_menjabat}</td>
                                    <td>{item.akhir_jabatan}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded text-sm font-medium ${
                                                item.status === "aktif"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {item.status || "-"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`btn-custom ${
                                                item.status === "aktif"
                                                    ? "btn-secondary"
                                                    : "btn-success"
                                            } me-1`}
                                            onClick={() =>
                                                handleToggleStatus(item.id)
                                            }
                                        >
                                            {item.status === "aktif"
                                                ? "Nonaktifkan"
                                                : "Aktifkan"}
                                        </button>

                                        <button
                                            className="btn-custom btn-warning me-1"
                                            onClick={() => openEdit(item)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn-custom btn-danger"
                                            onClick={() =>
                                                handleDelete(item.id)
                                            }
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">
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
                                        className={`page-item ${
                                            link.active ? "active" : ""
                                        } ${
                                            !link.url ? "disabled" : ""
                                        }`}
                                    >
                                        <Link
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
