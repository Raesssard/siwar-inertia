import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useEffect, useState } from "react"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"
import Swal from "sweetalert2"
import { FilterTransaksi } from "../Component/Filter"
import { EditTransaksi, PilihTransaksi, TambahTransaksi, TambahTransaksiPerKk } from "../Component/Modal"

export default function Transaksi() {
    const {
        title,
        transaksi: transaksiFromServer,
        transaksiWarga: transaksiWargaFromServer,
        transaksiUmum: transaksiUmumFromServer,
        daftar_tahun,
        daftar_bulan,
        list_kk,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const user = props.auth?.user
    const [transaksiList, setTransaksiList] = useState(transaksiFromServer?.data ?? [])
    const [transaksiWargaList, setTransaksiWargaList] = useState(transaksiWargaFromServer?.data ?? [])
    const [transaksiUmumList, setTransaksiUmumList] = useState(transaksiUmumFromServer?.data ?? [])
    const [selected, setSelected] = useState(null)
    const [showModalPilih, setShowModalPilih] = useState(false)
    const [showModalTambah, setShowModalTambah] = useState(false)
    const [showModalTambahPerKk, setShowModalTambahPerKk] = useState(false)
    const [showModalEdit, setShowModalEdit] = useState(false)
    const { get, data, setData } = useForm({
        search: '',
        tahun: '',
        bulan: '',
    })

    const toggleTambah = (pilihan) => {
        if (pilihan === 'perKk') {
            setShowModalTambahPerKk(true)
        } else {
            setShowModalTambah(true)
        }
    }

    const modalEdit = (tableData) => {
        setSelected(tableData)
        setShowModalEdit(true)
    }

    useEffect(() => {
        setTransaksiList(transaksiFromServer.data)
        setTransaksiWargaList(transaksiWargaFromServer.data)
        setTransaksiUmumList(transaksiUmumFromServer.data)
    }, [transaksiFromServer, transaksiWargaFromServer, transaksiUmumFromServer])

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
                    .then((res) => {
                        const jenis = res.data.jenis

                        Swal.fire("Terhapus!", "Data Transaksi berhasil dihapus.", "success")

                        if (jenis === 'kk') {
                            setTransaksiWargaList(prev => prev.filter(item => item.id !== id))
                        }

                        if (jenis === 'umum') {
                            setTransaksiUmumList(prev => prev.filter(item => item.id !== id))
                        }
                    })
                    .catch(() => {
                        console.log(`/${role}/transaksi/${id}, ini rutenya salah mas🗿`)
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
                transaksi={transaksiList}
                data={data}
                setData={setData}
                daftar_tahun={daftar_tahun}
                daftar_bulan={daftar_bulan}
                filter={filter}
                resetFilter={resetFilter}
                tambahShow={() => setShowModalTambahPerKk(true)}
                role={role}
            />
            
            <div className="table-container">
                <div className="table-header">
                    <h4>Transaksi Warga</h4>
                    <span></span>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-5 text-center" scope="col">No.</th>
                                <th className="px-5 text-center" scope="col">No. KK</th>
                                <th className="px-5 text-center" scope="col">Tanggal</th>
                                <th className="px-5 text-center" scope="col">Nama</th>
                                <th className="px-5 text-center" scope="col">Jenis</th>
                                <th className="px-5 text-center" scope="col">Nominal</th>
                                <th className="px-5 text-center" scope="col">Keterangan</th>
                                <th className="px-5 text-center" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksiWargaList.length > 0 ? (
                                transaksiWargaList.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.no_kk ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tanggal) ?? '-'}</td>
                                        <td className="text-start">{item.nama_transaksi ?? '-'}</td>
                                        <td className="text-center">
                                            {item.jenis === 'pemasukan' ? (
                                                <span className="badge bg-success text-white">Pemasukan</span>
                                            ) : (
                                                <span className="badge bg-danger text-white">Pengeluaran</span>
                                            )}
                                        </td>
                                        <td className="text-end">{formatRupiah(item.nominal) ?? '-'}</td>
                                        <td className="text-start">{item.keterangan ?? '-'}</td>
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
                {transaksiWargaFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {transaksiWargaFromServer.links.map((link, index) => {
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

            {/* <div className="table-container">
                <div className="table-header">
                    <h4>Transaksi Umum</h4>
                    <span></span>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-5 text-center" scope="col">No.</th>
                                <th className="px-5 text-center" scope="col">Tanggal</th>
                                <th className="px-5 text-center" scope="col">Nama</th>
                                <th className="px-5 text-center" scope="col">Jenis</th>
                                <th className="px-5 text-center" scope="col">Nominal</th>
                                <th className="px-5 text-center" scope="col">Keterangan</th>
                                <th className="px-5 text-center" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksiUmumList.length > 0 ? (
                                transaksiUmumList.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{formatTanggal(item.tanggal) ?? '-'}</td>
                                        <td className="text-left">{item.nama_transaksi ?? '-'}</td>
                                        <td className="text-center">
                                            {item.jenis === 'pemasukan' ? (
                                                <span className="badge bg-success text-white">Pemasukan</span>
                                            ) : (
                                                <span className="badge bg-danger text-white">Pengeluaran</span>
                                            )}
                                        </td>
                                        <td className="text-right">{formatRupiah(item.nominal) ?? '-'}</td>
                                        <td className="text-left">{item.keterangan ?? '-'}</td>
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
                {transaksiUmumFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {transaksiUmumFromServer.links.map((link, index) => {
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
            </div> */}
            <PilihTransaksi
                show={showModalPilih}
                togglePilih={toggleTambah}
                onClose={() => setShowModalPilih(false)}
            />
            <TambahTransaksiPerKk
                listKK={list_kk}
                tambahShow={showModalTambahPerKk}
                onClose={() => setShowModalTambahPerKk(false)}
                onAdded={(transaksiBaru, jenis) => {
                    if (jenis === 'kk') setTransaksiWargaList(prev => [transaksiBaru, ...prev])
                }}
                role={role}
            />
            {/* <TambahTransaksi
                tambahShow={showModalTambah}
                onClose={() => setShowModalTambah(false)}
                onAdded={(transaksiBaru, jenis) => {
                    if (jenis === 'umum') setTransaksiUmumList(prev => [transaksiBaru, ...prev])
                }}
                role={role}
            /> */}
            <EditTransaksi
                editShow={showModalEdit}
                onClose={() => setShowModalEdit(false)}
                onUpdated={(updated, jenis) => {
                    setSelected(updated)
                    if (jenis === 'kk') {
                        setTransaksiWargaList(prev =>
                            prev.map(item =>
                                item.id === updated.id ? updated : item
                            )
                        )
                    }
                    if (jenis === 'umum') {
                        setTransaksiUmumList(prev =>
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