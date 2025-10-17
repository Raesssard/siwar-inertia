import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useEffect, useState } from "react"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"
import Swal from "sweetalert2"
import { FilterTransaksi } from "../Component/Filter"
import { EditTransaksi, TambahTransaksi } from "../Component/Modal"

export default function Transaksi() {
    const {
        title,
        transaksi: transaksiFromServer,
        daftar_tahun,
        daftar_bulan,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const user = props.auth?.user
    const [transaksiList, setTransaksiList] = useState(transaksiFromServer.data || [])
    const [selected, setSelected] = useState(null)
    const [showModalTambah, setShowModalTambah] = useState(false)
    const [showModalEdit, setShowModalEdit] = useState(false)
    const { get, data, setData } = useForm({
        search: '',
        tahun: '',
        bulan: '',
    })

    const modalEdit = (tableData) => {
        setSelected(tableData)
        setShowModalEdit(true)
    }

    useEffect(() => {
        setTransaksiList(transaksiFromServer.data)
    }, [transaksiFromServer])

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/transaksi`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
            tahun: '',
            bulan: '',
        })
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
                axios.delete(`/${role}/transaksi/${id}`)
                    .then(() => {
                        Swal.fire("Terhapus!", "Data Transaksi berhasil dihapus.", "success")
                        setTransaksiList(prev => prev.filter(item => item.id !== id))
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
            <FilterTransaksi
                data={data}
                setData={setData}
                daftar_tahun={daftar_tahun}
                daftar_bulan={daftar_bulan}
                filter={filter}
                resetFilter={resetFilter}
                tambahShow={() => setShowModalTambah(true)}
                role={role}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Transaksi {role === 'rt' ? `RT ${user.rukun_tetangga?.nomor_rt}/RW ${user.rw?.nomor_rw}` : `RW ${user.rw?.nomor_rw}`}</h4>
                    <span></span>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">RT</th>
                                <th className="px-3 text-center" scope="col">Tanggal</th>
                                <th className="px-3 text-center" scope="col">Nama</th>
                                <th className="px-3 text-center" scope="col">Jenis</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Keterangan</th>
                                <th className="px-3 text-center" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksiList.length > 0 ? (
                                transaksiList.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.rt ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tanggal) ?? '-'}</td>
                                        <td className="text-center">{item.nama_transaksi ?? '-'}</td>
                                        <td className="text-center">
                                            {item.jenis === 'pemasukan' ? (
                                                <span className="badge bg-success text-white">Pemasukan</span>
                                            ) : (
                                                <span className="badge bg-danger text-white">Pengeluaran</span>
                                            )}
                                        </td>
                                        <td className="text-center">{formatRupiah(item.nominal) ?? '-'}</td>
                                        <td className="text-center">{item.keterangan ?? '-'}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button className="btn btn-sm btn-warning my-auto" title="Edit Transaksi" onClick={() => modalEdit(item)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger my-auto" title="Hapus Transaksi" onClick={() => handleDelete(item.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="20" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {transaksiFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {transaksiFromServer.links.map((link, index) => {
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
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
            <TambahTransaksi
                tambahShow={showModalTambah}
                onClose={() => setShowModalTambah(false)}
                onAdded={(transaksiBaru) => {
                    setTransaksiList(prev => [transaksiBaru, ...prev])
                }}
                role={role}
            />
            <EditTransaksi
                editShow={showModalEdit}
                onClose={() => setShowModalEdit(false)}
                onUpdated={(updated) => {
                    console.log(updated)
                    setSelected(updated)
                    setTransaksiList(prev =>
                        prev.map(item =>
                            item.id === updated.id ? updated : item
                        )
                    )
                }}
                role={role}
                selectedData={selected}
            />
        </Layout>
    )
}