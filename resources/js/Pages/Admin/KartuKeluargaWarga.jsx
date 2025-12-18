import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, router, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { FilterKK } from "../Component/Filter"
import { DetailKK, TambahEditKK } from "../Component/Modal"
import "../../../css/kk.css"

export default function KartuKeluarga() {
    const { kartu_keluarga, kategori_iuran, title } = usePage().props
    const { props } = usePage()
    const user = props.auth?.user
    const role = props.auth?.currentRole

    const { get, data, setData } = useForm({ search: "" })

    // 🟩 State untuk modal
    const [showModal, setShowModal] = useState(false)
    const [selected, setSelected] = useState(null)
    const [modalTambah, setModalTambah] = useState(false)
    const [modalEdit, setModalEdit] = useState(false)
    const [selectedEdit, setSelectedEdit] = useState(null)

    // 🔹 Modal Detail KK
    const modalDetail = (item) => {
        setSelected(item)
        setShowModal(true)
    }

    // 🔹 Modal Edit
    const openEditModal = (item) => {
        setSelectedEdit(item)
        setModalEdit(true)
    }

    // 🔹 Hapus KK
    const hapusKK = (id, no_kk) => {
        if (confirm(`Yakin ingin menghapus KK dengan nomor ${no_kk}?`)) {
            router.delete(`/${role}/kartu_keluarga/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    alert(`Kartu Keluarga ${no_kk} berhasil dihapus.`)
                },
                onError: (errors) => {
                    console.error(errors)
                    alert("Terjadi kesalahan saat menghapus data.")
                },
            })
        }
    }

    // 🔹 Filter
    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/kartu_keluarga`, { preserveState: true, preserveScroll: true })
    }

    // 🔹 Reset Filter
    const resetFilter = () => setData({ search: "" })

    return (
        <Layout>
            <Head
                title={`${title} - ${role.length <= 2
                    ? role.toUpperCase()
                    : role.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />

            <FilterKK
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
            />

            <div className="table-container">
                <div className="table-header d-flex justify-content-between align-items-center">
                    <h4>Warga</h4>

                    {/* 🔘 Tombol Tambah KK */}
                    <Link
                        preserveScroll
                        preserveState
                        href={`/${role}/kartu_keluarga/create`}
                        className="btn btn-success btn-sm"
                    >
                        <i className="bi bi-plus-circle"></i> Tambah KK
                    </Link>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="text-center">No.</th>
                                <th className="text-center">NOMOR KK</th>
                                <th className="text-center">KEPALA KELUARGA</th>
                                <th className="text-center">ALAMAT</th>
                                <th className="text-center">NOMOR RT</th>
                                <th className="text-center">NOMOR RW</th>
                                <th className="text-center">KATEGORI IURAN</th>
                                <th className="text-center">AKSI</th>
                            </tr>
                        </thead>

                        <tbody>
                            {kartu_keluarga.data.length > 0 ? (
                                kartu_keluarga.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.no_kk ?? "-"}</td>
                                        <td className="text-center">
                                            {(item.warga ?? [])
                                                .find(
                                                    (w) =>
                                                        w.status_hubungan_dalam_keluarga?.toLowerCase() ===
                                                        "kepala keluarga"
                                                )
                                                ?.nama ?? "-"}
                                        </td>
                                        <td className="text-center">{item.alamat ?? "-"}</td>
                                        <td className="text-center">
                                            {item.rukun_tetangga?.nomor_rt ?? "-"}
                                        </td>
                                        <td className="text-center">
                                            {item.rw?.nomor_rw ?? "-"}
                                        </td>
                                        <td className="text-center">
                                            {item.kategori_golongan?.jenis
                                                ? item.kategori_golongan.jenis.charAt(0).toUpperCase() +
                                                item.kategori_golongan.jenis.slice(1)
                                                : "-"}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-success btn-sm me-1"
                                                title="Detail KK"
                                                onClick={() => modalDetail(item)}
                                            >
                                                <i className="fas fa-info"></i>
                                            </button>
                                            <Link
                                                preserveScroll
                                                preserveState
                                                href={`/${role}/kartu_keluarga/${item.id}/edit`}
                                                className="btn btn-warning btn-sm me-1"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Link>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                title="Hapus KK"
                                                onClick={() => hapusKK(item.id, item.no_kk)}
                                            >
                                                <i className="fas fa-trash"></i>
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
                </div>

                {/* 🔹 Pagination */}
                {kartu_keluarga.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {kartu_keluarga.links.map((link, index) => {
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

                {/* 🔹 Modal Detail */}
                <DetailKK
                    selectedData={selected}
                    detailShow={showModal}
                    onClose={() => setShowModal(false)}
                    role={role}
                    userData={user}
                />

                {/* 🔹 Modal Tambah */}
                <TambahEditKK
                    show={modalTambah}
                    onClose={() => setModalTambah(false)}
                    kategoriIuran={kategori_iuran}
                    daftarRT={props.daftar_rt}
                    role={role}
                />

                {/* 🔹 Modal Edit */}
                <TambahEditKK
                    show={modalEdit}
                    onClose={() => setModalEdit(false)}
                    dataKK={selectedEdit}
                    kategoriIuran={kategori_iuran}
                    daftarRT={props.daftar_rt}
                    role={role}
                />
            </div>
        </Layout>
    )
}
