import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { FilterIuran } from "../Component/Filter"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"
import { EditIuranManual, EditIuranOtomatis, TambahIuran } from "../Component/Modal"
import Swal from "sweetalert2"

export default function Iuran() {
    const {
        iuranOtomatis: iuranOtomatisFromServer,
        iuranManual: iuranManualFromServer,
        golongan_list,
        nik_list,
        no_kk_list,
        title,
    } = usePage().props
    const [selected, setSelected] = useState(null)
    const [selectedIuran, setSelectedIuran] = useState(null)
    const [selectedGolongan, setSelectedGolongan] = useState(null)
    const [iuranListManual, setIuranListManual] = useState(iuranManualFromServer.data || [])
    const [iuranListOtomatis, setIuranListOtomatis] = useState(iuranOtomatisFromServer.data || [])
    const [showModalTambah, setShowModalTambah] = useState(false)
    const [showModalEdit, setShowModalEdit] = useState(false)
    const [showModalEditManual, setShowModalEditManual] = useState(false)
    const { props } = usePage()
    const role = props.auth?.currentRole
    const { get, data, setData } = useForm({
        search: '',
    })

    const modalEditManual = (item, matched, gol) => {
        setSelected(item)
        setSelectedIuran(matched)
        setSelectedGolongan(gol)
        setShowModalEditManual(true)
    }

    const modalEdit = (item, matched, gol) => {
        setSelected(item)
        setSelectedIuran(matched)
        setSelectedGolongan(gol)
        setShowModalEdit(true)
    }

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/iuran`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
        })
    }

    const handleAdded = (newIuran) => {
        if (newIuran.jenis === "otomatis") {
            setIuranListOtomatis(prev => [newIuran, ...prev])
        } else {
            setIuranListManual(prev => [newIuran, ...prev])
        }
    }

    const handleDelete = (id, jenis) => {
        Swal.fire({
            title: "Yakin hapus iuran ini?",
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/${role}/iuran/${id}/${jenis}`)
                    .then((res) => {
                        Swal.fire("Terhapus!", "Data iuran berhasil dihapus.", "success")
                        const jenis = res.data?.jenis
                        if (jenis === "otomatis") {
                            setIuranListOtomatis(prev => prev.map(item => ({
                                ...item,
                                iuran_golongan: item.iuran_golongan.filter(g => g.id !== id)
                            })))
                        } else {
                            setIuranListManual(prev => prev.filter(item => item.id !== id))
                        }
                    })
                    .catch(() => {
                        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error")
                    })
            }
        })
    }

    let no = 1

    const rows = iuranListOtomatis.flatMap((item, index) =>
        golongan_list
            .map((gol) => {
                const matched = item.iuran_golongan?.find(ig => ig.id_golongan === gol.id)
                if (!matched) return null
                return (
                    <tr key={`${item.id}-${gol.id}`}>
                        <td className="text-center">{no++}</td>
                        <td className="text-center">{item.nama ?? '-'}</td>
                        <td className="text-center">
                            {gol.jenis.charAt(0).toUpperCase() + gol.jenis.slice(1)}
                        </td>
                        <td className="text-center">{formatRupiah(matched.nominal)}</td>
                        <td className="text-center">{formatTanggal(item.tgl_tagih) ?? '-'}</td>
                        <td className="text-center">{formatTanggal(item.tgl_tempo) ?? '-'}</td>
                        {/* <td className="text-center">
                            <div className="d-flex justify-content-center align-items-center gap-2">
                                <button
                                    className="btn btn-sm btn-warning my-auto"
                                    title="Edit Iuran"
                                    onClick={() => modalEdit(item, matched, gol)}
                                >
                                    <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button
                                    className="btn btn-sm btn-danger my-auto"
                                    title="Hapus Iuran"
                                    onClick={() => handleDelete(matched.id, item.jenis)}
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td> */}
                    </tr>
                )
            })
            .filter(Boolean)
    )


    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterIuran
                iuranManual={iuranListManual}
                iuranOtomatis={iuranListOtomatis}
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
                tambahShow={() => setShowModalTambah(true)}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Jenis Iuran (Manual)</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Nama</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tagih</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tempo</th>
                                {/* <th className="px-3 text-center" scope="col">Aksi</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {iuranListManual.length > 0 ? (
                                iuranListManual.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.nama ?? '-'}</td>
                                        <td className="text-center">{formatRupiah(item.nominal) ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tagih) ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tempo) ?? '-'}</td>
                                        {/* <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button
                                                    className="btn btn-sm btn-warning my-auto"
                                                    title="Edit Iuran"
                                                    onClick={() => modalEditManual(item)}
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger my-auto" title="Hapus Iuran" onClick={() => handleDelete(item.id, item.jenis)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td> */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {iuranManualFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {iuranManualFromServer.links.map((link, index) => {
                                let label = link.label;
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
            <div className="table-container">
                <div className="table-header">
                    <h4>Jenis Iuran (Otomatis)</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Nama</th>
                                <th className="px-3 text-center" scope="col">Golongan</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tagih</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tempo</th>
                                {/* <th className="px-3 text-center" scope="col">Aksi</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length > 0 ? (
                                rows
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {iuranOtomatisFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {iuranOtomatisFromServer.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes("Previous")) label = "&lt;";
                                if (label.includes("Next")) label = "&gt;";

                                return (
                                    <li
                                        key={index}
                                        className={`page-item ${link.active ? "active" : ""} ${!link.url ? "disabled" : ""
                                            }`}
                                        style={{ cursor: !link.url ? "not-allowed" : "pointer" }}
                                    >
                                        <Link
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
            {/* <TambahIuran
                tambahShow={showModalTambah}
                onClose={() => setShowModalTambah(false)}
                onAdded={handleAdded}
                role={role}
                golongan={golongan_list}
                nik={nik_list}
                no_kk={no_kk_list}
            />
            <EditIuranManual
                editShow={showModalEditManual}
                onClose={() => setShowModalEditManual(false)}
                onUpdated={(updated) => {
                    setSelected(updated)
                    setIuranListManual(prev =>
                        prev.map(item =>
                            item.id === updated.id ? updated : item
                        )
                    )
                }}
                role={role}
                iuran={selected}
            />
            <EditIuranOtomatis
                editShow={showModalEdit}
                onClose={() => setShowModalEdit(false)}
                onUpdated={(updated) => {
                    setSelected(updated)
                    setIuranListOtomatis(prev =>
                        prev.map(item =>
                            item.id === updated.id ? updated : item
                        )
                    )
                }}
                role={role}
                golongan={selectedGolongan}
                iuranGol={selectedIuran}
                iuran={selected}
            /> */}
        </Layout>
    )
}