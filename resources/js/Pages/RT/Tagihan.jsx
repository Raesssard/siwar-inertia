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
        setData({
            search: '',
        })
    }

    const handleDelete = (id) => {
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
                axios.delete(`/${role}/tagihan/${id}`)
                    .then((res) => {
                        Swal.fire("Terhapus!", "Data iuran berhasil dihapus.", "success")
                        const jenis = res.data?.jenis
                        if (jenis === "otomatis") {
                            setTagihanOtomatisList(prev => prev.filter(item => item.id !== id))
                        } else {
                            setTagihanManualList(prev => prev.filter(item => item.id !== id))
                        }
                    })
                    .catch(() => {
                        console.log(`/${role}/tagihan/${id}, ini rutenya salah mas🗿`)
                        console.log(id)
                        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error")
                    })
            }
        })
    }

    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterTagihan
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
                kk_list={kartuKeluargaForFilter}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Tagihan Manual</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Nama Iuran</th>
                                <th className="px-3 text-center" scope="col">No. KK</th>
                                <th className="px-3 text-center" scope="col">Nama Kepala Keluarga</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tagih</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tempo</th>
                                <th className="px-3 text-center" scope="col">Status</th>
                                <th className="px-3 text-center" scope="col">Tanggal Bayar</th>
                                <th className="px-3 text-center" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tagihanManualList?.length > 0 ? (
                                tagihanManualList?.map((item, index) => (
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
                                        <td className="text-center">{item.status_bayar === 'sudah_bayar' ? (
                                            <span className="badge bg-success text-white">Sudah Bayar</span>
                                        ) : (
                                            <span className="badge bg-warning text-white">Belum Bayar</span>
                                        )}
                                        </td>
                                        <td className="text-center">{formatTanggal(item.tgl_bayar)}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button className="btn btn-sm btn-warning my-auto" title="Edit Tagihan" onClick={() => modalEdit(item)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger my-auto" title="Hapus Tagihan" onClick={() => handleDelete(item.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {tagihanManualFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {tagihanManualFromServer.links.map((link, index) => {
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
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Tagihan Otomatis</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Nama Iuran</th>
                                <th className="px-3 text-center" scope="col">No. KK</th>
                                <th className="px-3 text-center" scope="col">Nama Kepala Keluarga</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tagih</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tempo</th>
                                <th className="px-3 text-center" scope="col">Status</th>
                                <th className="px-3 text-center" scope="col">Tanggal Bayar</th>
                                <th className="px-3 text-center" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tagihanOtomatisList?.length > 0 ? (
                                tagihanOtomatisList?.map((item, index) => (
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
                                        <td className="text-center">{item.status_bayar === 'sudah_bayar' ? (
                                            <span className="badge bg-success text-white">Sudah Bayar</span>
                                        ) : (
                                            <span className="badge bg-warning text-white">Belum Bayar</span>
                                        )}
                                        </td>
                                        <td className="text-center">{formatTanggal(item.tgl_bayar)}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button className="btn btn-sm btn-warning my-auto" title="Edit Tagihan" onClick={() => modalEdit(item)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger my-auto" title="Hapus Tagihan" onClick={() => handleDelete(item.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {tagihanOtomatisFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {tagihanOtomatisFromServer.links.map((link, index) => {
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
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
            <EditTagihan
                editShow={showModalEdit}
                onClose={() => setShowModalEdit(false)}
                onUpdated={(updated) => {
                    setSelected(updated)
                    if (updated.iuran.jenis === "manual") {
                        setTagihanManualList(prev =>
                            prev.map(item =>
                                item.id === updated.id ? updated : item
                            )
                        )
                    } else {

                        setTagihanOtomatisList(prev =>
                            prev.map(item =>
                                item.id === updated.id ? updated : item
                            )
                        )
                    }
                }}
                role={role}
                selectedData={selected}
            />
        </Layout>
    )
}