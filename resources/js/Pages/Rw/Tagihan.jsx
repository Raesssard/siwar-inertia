import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"
import Swal from "sweetalert2"
import { FilterTagihan } from "../Component/Filter"
import { EditTagihan } from "../Component/Modal"

export default function Tagihan() {
    const {
        title,
        tagihanManual: tagihanManualFromServer,
        tagihanOtomatis: tagihanOtomatisFromServer,
        kartuKeluargaForFilter
    } = usePage().props

    const [selected, setSelected] = useState(null)
    const [tagihanManualList, setTagihanManualList] = useState(tagihanManualFromServer.data || [])
    const [tagihanOtomatisList, setTagihanOtomatisList] = useState(tagihanOtomatisFromServer.data || [])
    const [showModalEdit, setShowModalEdit] = useState(false)
    const { props } = usePage()
    const role = props.auth?.currentRole
    const { get, data, setData } = useForm({
        search: '',
    })

    const modalEdit = (item) => {
        setSelected(item)
        setShowModalEdit(true)
    }

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/tagihan`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({ search: '' })
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: "Yakin hapus tagihan ini?",
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/${role}/tagihan/${id}`)
                    .then((res) => {
                        Swal.fire("Terhapus!", "Data Tagihan berhasil dihapus.", "success")
                        const jenis = res.data?.jenis
                        if (jenis === "otomatis") {
                            setTagihanOtomatisList(prev => prev.filter(item => item.id !== id))
                        } else {
                            setTagihanManualList(prev => prev.filter(item => item.id !== id))
                        }
                    })
                    .catch(() => {
                        console.log(`/${role}/tagihan/${id}, rute error`)
                        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error")
                    })
            }
        })
    }

    return (
        <Layout>
            <Head title={`${title} - RW`} />
            <FilterTagihan
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
                kk_list={kartuKeluargaForFilter}
            />

            {/* ====== TABEL TAGIHAN MANUAL ====== */}
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Tagihan Manual</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Nama Tagihan</th>
                                <th>No. KK</th>
                                <th>Nama Kepala Keluarga</th>
                                <th>Nominal</th>
                                <th>Tanggal Tagih</th>
                                <th>Tanggal Tempo</th>
                                <th>Status</th>
                                <th>Tanggal Bayar</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tagihanManualList?.length > 0 ? (
                                tagihanManualList.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.nama ?? '-'}</td>
                                        <td className="text-center">{item.no_kk ?? '-'}</td>
                                        <td className="text-center">
                                            {item.kartu_keluarga?.warga?.find(w => w.status_hubungan_dalam_keluarga === 'kepala keluarga')?.nama ?? '-'}
                                        </td>
                                        <td className="text-center">{formatRupiah(item.nominal) ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tagih)}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tempo)}</td>
                                        <td className="text-center">
                                            {item.status_bayar === 'sudah_bayar'
                                                ? <span className="badge bg-success">Sudah Bayar</span>
                                                : <span className="badge bg-warning">Belum Bayar</span>}
                                        </td>
                                        <td className="text-center">{formatTanggal(item.tgl_bayar)}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-sm btn-warning" onClick={() => modalEdit(item)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center">Tidak ada data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====== TABEL TAGIHAN OTOMATIS ====== */}
            <div className="table-container mt-4">
                <div className="table-header">
                    <h4>Data Tagihan Otomatis</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Nama Tagihan</th>
                                <th>No. KK</th>
                                <th>Nama Kepala Keluarga</th>
                                <th>Nominal</th>
                                <th>Tanggal Tagih</th>
                                <th>Tanggal Tempo</th>
                                <th>Status</th>
                                <th>Tanggal Bayar</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tagihanOtomatisList?.length > 0 ? (
                                tagihanOtomatisList.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.nama ?? '-'}</td>
                                        <td className="text-center">{item.no_kk ?? '-'}</td>
                                        <td className="text-center">
                                            {item.kartu_keluarga?.warga?.find(w => w.status_hubungan_dalam_keluarga === 'kepala keluarga')?.nama ?? '-'}
                                        </td>
                                        <td className="text-center">{formatRupiah(item.nominal) ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tagih)}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tempo)}</td>
                                        <td className="text-center">
                                            {item.status_bayar === 'sudah_bayar'
                                                ? <span className="badge bg-success">Sudah Bayar</span>
                                                : <span className="badge bg-warning">Belum Bayar</span>}
                                        </td>
                                        <td className="text-center">{formatTanggal(item.tgl_bayar)}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-sm btn-warning" onClick={() => modalEdit(item)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center">Tidak ada data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EditTagihan
                editShow={showModalEdit}
                onClose={() => setShowModalEdit(false)}
                onUpdated={(updated) => {
                    if (updated.iuran.jenis === "manual") {
                        setTagihanManualList(prev => prev.map(item => item.id === updated.id ? updated : item))
                    } else {
                        setTagihanOtomatisList(prev => prev.map(item => item.id === updated.id ? updated : item))
                    }
                }}
                role={role}
                selectedData={selected}
            />
        </Layout>
    )
}
