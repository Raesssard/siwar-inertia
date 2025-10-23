import React, { useState } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import Layout from "@/Layouts/Layout";
import { AddRtModal, EditRtModal } from "@/Pages/Component/Modal";

export default function Rt({ rukun_tetangga, filters, nomorRtList, rwList, title }) {
    const { props } = usePage()
    const role = props.auth?.currentRole
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(null);

    const [form, setForm] = useState({
        nik: "",
        nomor_rt: "",
        nama_anggota_rt: "",
        mulai_menjabat: "",
        akhir_jabatan: "",
        status: "aktif",
    });

    const [search, setSearch] = useState({
        keyword: filters?.keyword || "",
        nomor_rt: filters?.nomor_rt || "",
    });

    // --- handler form RT ---
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
                    nama_anggota_rt: "",
                    mulai_menjabat: "",
                    akhir_jabatan: "",
                    status: "aktif",
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

    // 🔹 Toggle status aktif / nonaktif
    const handleToggleStatus = (id) => {
        if (confirm("Yakin ingin mengubah status RT ini?")) {
            router.put(route("admin.rt.toggleStatus", id), {}, {
                preserveScroll: true,
            });
        }
    };

    const openEdit = (rtItem) => {
        setForm({
            nik: rtItem.nik || "",
            nomor_rt: rtItem.nomor_rt || "",
            nama_anggota_rt: rtItem.nama_anggota_rt || "",
            mulai_menjabat: rtItem.mulai_menjabat || "",
            akhir_jabatan: rtItem.akhir_jabatan || "",
            status: rtItem.status || "aktif",
        });
        setShowEdit(rtItem);
    };

    // --- handler filter ---
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
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
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
                    className="ms-2"
                >
                    <option value="">-- Semua Nomor RT --</option>
                    {nomorRtList.map((rtItem, index) => (
                        <option key={index} value={rtItem.nomor_rt || rtItem}>
                            RT {rtItem.nomor_rt || rtItem}
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
                            <th className="text-center">No</th>
                            <th className="text-center">NIK</th>
                            <th className="text-center">Nomor RT</th>
                            <th className="text-center">Nama Anggota RT</th>
                            <th className="text-center">Mulai Menjabat</th>
                            <th className="text-center">Akhir Jabatan</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rukun_tetangga.data.length > 0 ? (
                            rukun_tetangga.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="text-center">{rukun_tetangga.from + index}</td>
                                    <td className="text-center">{item.nik || "-"}</td>
                                    <td className="text-center">{item.nomor_rt || "-"}</td>
                                    <td className="text-center">{item.nama_anggota_rt || "-"}</td>
                                    <td className="text-center">{item.mulai_menjabat || "-"}</td>
                                    <td className="text-center">{item.akhir_jabatan || "-"}</td>
                                    <td className="text-center align-middle">
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                                            item.status === "aktif"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                        >
                                            {item.status || "-"}
                                        </span>
                                        </td>

                                    <td className="text-center align-middle">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                            className={`btn-custom ${
                                                item.status === "aktif" ? "btn-secondary" : "btn-success"
                                            }`}
                                            onClick={() => handleToggleStatus(item.id)}
                                            >
                                            {item.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                                            </button>

                                            <button
                                            className="btn-custom btn-warning"
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
                                        </div>
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
                <AddRtModal
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                    rwList={rwList}
                    isRw={false}
                />
            )}

            {/* Modal Edit */}
            {showEdit && (
                <EditRtModal
                    form={form}
                    handleChange={handleChange}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                    rwList={rwList}
                    isRw={false}
                />
            )}
        </Layout>
    );
}
