// resources/js/Pages/Admin/Rt.jsx
import React, { useState } from "react"
import Layout from "@/Layouts/Layout"
import { route } from "ziggy-js"
import { Head, Link, router, usePage } from "@inertiajs/react"
import { AddRtModal, EditRtModal } from "@/Pages/Component/Modal"
import "../../../css/kk.css" // biar tabelnya sama gayanya

export default function Rt() {
    const {
        rukun_tetangga,
        filters,
        nomorRtList,
        rwList,
        title,
        warga,
        roles } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole

    const [showAdd, setShowAdd] = useState(false)
    const [showEdit, setShowEdit] = useState(null)

    const [form, setForm] = useState({
        nik: "",
        id_rw: "",
        nomor_rt: "",
        nama_anggota_rt: "",
        mulai_menjabat: "",
        akhir_jabatan: "",
        status: "aktif",
    })

    const [search, setSearch] = useState({
        keyword: filters?.keyword || "",
        nomor_rt: filters?.nomor_rt || "",
    })

    // --- Form Handlers ---
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleAdd = (e) => {
        e.preventDefault()
        router.post(route("admin.rt.store"), form, {
            onSuccess: () => {
                setShowAdd(false)
                setForm({
                    nik: "",
                    id_rw: "",
                    nomor_rt: "",
                    nama_anggota_rt: "",
                    mulai_menjabat: "",
                    akhir_jabatan: "",
                    status: "aktif",
                })
            },
        })
    }

    const handleEdit = (e) => {
        e.preventDefault()
        router.put(route("admin.rt.update", showEdit.id), form, {
            onSuccess: () => setShowEdit(null),
        })
    }

    const handleDelete = (id) => {
        if (confirm("Yakin ingin menghapus data RT ini?")) {
            router.delete(route("admin.rt.destroy", id))
        }
    }

    const handleToggleStatus = (id) => {
        if (confirm("Yakin ingin mengubah status RT ini?")) {
            router.put(route("admin.rt.toggleStatus", id), {}, { preserveScroll: true })
        }
    }

    const openEdit = (item) => {
        setForm({
            nik: item.nik || "",
            id_rw: item.id_rw || "",
            nomor_rt: item.nomor_rt || "",
            nama_anggota_rt: item.nama_anggota_rt || "",
            mulai_menjabat: item.mulai_menjabat || "",
            akhir_jabatan: item.akhir_jabatan || "",
            status: item.status || "aktif",
        })
        setShowEdit(item)
    }

    // --- Filter Handlers ---
    const handleSearchChange = (e) =>
        setSearch({ ...search, [e.target.name]: e.target.value })

    const applyFilter = (e) => {
        e.preventDefault()
        router.get(route("admin.rt.index"), search, {
            replace: true,
            preserveScroll: true,
        })
    }

    const resetFilter = () => {
        setSearch({ keyword: "", nomor_rt: "" })
        router.get(route("admin.rt.index"), {}, { replace: true, preserveScroll: true })
    }

    return (
        <Layout>
            <Head
                title={`${title} - ${role.length <= 2
                    ? role.toUpperCase()
                    : role.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />

            {/* 🔹 Filter Section */}
            <form onSubmit={applyFilter} className="filter-form mb-4 d-flex align-items-center">
                <input
                    type="text"
                    name="keyword"
                    placeholder="Cari NIK atau Nama Ketua RT..."
                    value={search.keyword}
                    onChange={handleSearchChange}
                    className="me-2"
                />

                <select
                    name="nomor_rt"
                    value={search.nomor_rt}
                    onChange={handleSearchChange}
                    className="me-2"
                >
                    <option value="">-- Semua Nomor RT --</option>
                    {nomorRtList.map((rtItem, index) => (
                        <option key={index} value={rtItem.nomor_rt || rtItem}>
                            RT {rtItem.nomor_rt || rtItem}
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
                    <h4>Data RT</h4>
                    <button
                        className="btn btn-success btn-sm"
                        onClick={() => setShowAdd(true)}
                    >
                        Tambah RT
                    </button>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="text-center px-3">No.</th>
                                <th className="text-center px-3">NIK</th>
                                <th className="text-center px-3">NOMOR RT</th>
                                <th className="text-center px-3">NAMA ANGGOTA RT</th>
                                <th className="text-center px-3">MULAI MENJABAT</th>
                                <th className="text-center px-3">AKHIR JABATAN</th>
                                <th className="text-center px-3">STATUS</th>
                                <th className="text-center px-3">AKSI</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rukun_tetangga.data.length > 0 ? (
                                rukun_tetangga.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">
                                            {rukun_tetangga.from + index}
                                        </td>
                                        <td className="text-center">{item.nik || "-"}</td>
                                        <td className="text-center">{item.nomor_rt || "-"}</td>
                                        <td className="text-center">
                                            {item.nama_anggota_rt || "-"}
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
                                                title="Ganti status RT"
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
                                    <td colSpan="8" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 🔹 Pagination */}
                {rukun_tetangga.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {rukun_tetangga.links.map((link, index) => {
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

            {/* 🔹 Modal Tambah/Edit */}
            {showAdd && (
                <AddRtModal
                    dataWarga={warga}
                    form={form}
                    handleChange={handleChange}
                    handleAdd={handleAdd}
                    onClose={() => setShowAdd(false)}
                    rwList={rwList}
                    isRw={false}
                    roles={roles}
                />
            )}

            {showEdit && (
                <EditRtModal
                    form={form}
                    handleChange={handleChange}
                    handleEdit={handleEdit}
                    onClose={() => setShowEdit(null)}
                    rwList={rwList}
                    isRw={false}
                    roles={roles}
                />
            )}
        </Layout>
    )
}
