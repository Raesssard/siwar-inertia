import React, { useState } from "react"
import Layout from "@/Layouts/Layout"
import { route } from "ziggy-js"
import { Head, Link, router, usePage } from "@inertiajs/react"
import { AddRwModal, EditRwModal } from "@/Pages/Component/Modal"
import "../../../css/kk.css" // biar gaya tabelnya sama

export default function Rw({ rw, filters, nomorRwList, title, roles }) {
    const { props } = usePage()
    const role = props.auth?.currentRole

    const [showAdd, setShowAdd] = useState(false)
    const [showEdit, setShowEdit] = useState(null)

    const [form, setForm] = useState({
        nik: "",
        nomor_rw: "",
        nama_anggota_rw: "",
        mulai_menjabat: "",
        akhir_jabatan: "",
        status: "aktif",
    })

    const [search, setSearch] = useState({
        keyword: filters?.keyword || "",
        nomor_rw: filters?.nomor_rw || "",
    })

    // --- Form Handlers ---
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleAdd = (e) => {
        e.preventDefault()
        router.post(route("admin.rw.store"), form, {
            onSuccess: () => {
                setShowAdd(false)
                setForm({
                    nik: "",
                    nomor_rw: "",
                    nama_anggota_rw: "",
                    mulai_menjabat: "",
                    akhir_jabatan: "",
                    status: "aktif",
                })
            },
        })
    }

    const handleEdit = (e) => {
        e.preventDefault()
        router.put(route("admin.rw.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        })
    }

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus data RW ini?")) {
            router.delete(route("admin.rw.destroy", id))
        }
    }

    const handleToggleStatus = (id) => {
        if (confirm("Yakin ingin mengubah status RW ini?")) {
            router.put(route("admin.rw.toggleStatus", id), {}, { preserveScroll: true })
        }
    }

    const openEdit = (item) => {
        setForm({
            nik: item.nik || "",
            nomor_rw: item.nomor_rw || "",
            nama_anggota_rw: item.nama_anggota_rw || "",
            mulai_menjabat: item.mulai_menjabat || "",
            akhir_jabatan: item.akhir_jabatan || "",
            status: item.status || "aktif",
        })
        setShowEdit(item)
    }

    // --- Filter ---
    const handleSearchChange = (e) =>
        setSearch({ ...search, [e.target.name]: e.target.value })

    const applyFilter = (e) => {
        e.preventDefault()
        router.get(route("admin.rw.index"), search, {
            replace: true,
            preserveScroll: true,
        })
    }

    const resetFilter = () => {
        setSearch({ keyword: "", nomor_rw: "" })
        router.get(route("admin.rw.index"), {}, { replace: true, preserveScroll: true })
    }

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
                    name="keyword"
                    placeholder="Cari NIK atau Nama Ketua RW..."
                    value={search.keyword}
                    onChange={handleSearchChange}
                    className="me-2"
                />

                <select
                    name="nomor_rw"
                    value={search.nomor_rw}
                    onChange={handleSearchChange}
                    className="me-2"
                >
                    <option value="">-- Semua Nomor RW --</option>
                    {nomorRwList.map((rwItem, index) => (
                        <option key={index} value={rwItem.nomor_rw}>
                            RW {rwItem.nomor_rw}
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

            {/* 🔹 Table Section */}
            <div className="table-container">
                <div className="table-header d-flex justify-content-between align-items-center">
                    <h4>Data RW</h4>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah RW
                    </button>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="text-center px-3">No.</th>
                                <th className="text-center px-3">NIK</th>
                                <th className="text-center px-3">NOMOR RW</th>
                                <th className="text-center px-3">NAMA ANGGOTA RW</th>
                                <th className="text-center px-3">MULAI MENJABAT</th>
                                <th className="text-center px-3">AKHIR JABATAN</th>
                                <th className="text-center px-3">STATUS</th>
                                <th className="text-center px-3">AKSI</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rw.data.length > 0 ? (
                                rw.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{rw.from + index}</td>
                                        <td className="text-center">{item.nik || "-"}</td>
                                        <td className="text-center">{item.nomor_rw || "-"}</td>
                                        <td className="text-center">
                                            {item.nama_anggota_rw || "-"}
                                        </td>
                                        <td className="text-center">{item.mulai_menjabat || "-"}</td>
                                        <td className="text-center">{item.akhir_jabatan || "-"}</td>
                                        <td className="text-center align-middle">
                                            <span
                                                className={`inline-block px-2 py-1 rounded text-sm font-medium ${item.status === "aktif"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                                onClick={() => handleToggleStatus(item.id)}
                                                style={{ cursor: 'pointer', width: '4.25rem' }}
                                                title="Ganti status RW"
                                            >
                                                {item.status || "-"}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                {/* <button
                                                    className={`btn btn-sm ${
                                                        item.status === "aktif"
                                                            ? "btn-secondary"
                                                            : "btn-success"
                                                    }`}
                                                    onClick={() => handleToggleStatus(item.id)}
                                                >
                                                    {item.status === "aktif"
                                                        ? "Nonaktifkan"
                                                        : "Aktifkan"}
                                                </button> */}

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
                                    <td colSpan="8" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🔹 Pagination */}
                {rw.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {rw.links.map((link, index) => {
                                let label = link.label
                                if (label.includes("Previous")) label = "&lt;"
                                if (label.includes("Next")) label = "&gt;"

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
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* 🔹 Modal Tambah/Edit */}
            {showAdd && (
                <AddRwModal
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                    roles={roles}
                />
            )}

            {showEdit && (
                <EditRwModal
                    form={form}
                    handleChange={handleChange}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                    roles={roles}
                />
            )}
        </Layout>
    )
}
