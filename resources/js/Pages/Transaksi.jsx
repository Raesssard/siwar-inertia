import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useEffect, useState } from "react"
import Swal from "sweetalert2"
import axios from "axios"
import { formatRupiah, formatTanggal } from "./Component/GetPropRole"
import { FilterTransaksi } from "./Component/Filter"
import {
    EditTransaksi,
    TambahTransaksiPerKk,
} from "./Component/Modal"
export default function Transaksi() {
    const {
        title,
        transaksi: transaksiServer,
        daftar_tahun,
        daftar_bulan,
        daftar_rw,
        daftar_rt,
        list_kk,
        transaksiWarga,
        transaksiUmum,
    } = usePage().props

    const role = usePage().props.auth?.currentRole
    const user = usePage().props.auth?.user

    // ===================== STATE ===================== //
    const [transaksiList, setTransaksiList] = useState(transaksiServer?.data ?? [])
    const [selected, setSelected] = useState(null)
    const [showTambahPerKk, setShowTambahPerKk] = useState(false)
    const [showEdit, setShowEdit] = useState(false)

    const { get, data, setData } = useForm({
        search: "",
        tahun: "",
        bulan: "",
        rt: "",
        rw: "",
    })

    // Reload data ketika dari server berubah
    useEffect(() => {
        setTransaksiList(transaksiServer?.data ?? [])
    }, [transaksiServer])

    // ===================== FILTER ===================== //
    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/transaksi`, { preserveScroll: true, preserveState: true })
    }

    const resetFilter = () => {
        setData({
            search: "",
            tahun: "",
            bulan: "",
            rt: "",
            rw: "",
        })
    }

    // ===================== MODAL ===================== //
    const modalEdit = (item) => {
        setSelected(item)
        setShowEdit(true)
    }

    const handleDelete = (id) => {
        Swal.fire({
            title: "Yakin ingin menghapus transaksi?",
            text: "Data yang dihapus tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((res) => {
            if (res.isConfirmed) {
                axios
                    .delete(`/${role}/transaksi/${id}`)
                    .then(() => {
                        Swal.fire("Berhasil!", "Transaksi dihapus.", "success")
                        setTransaksiList((prev) =>
                            prev.filter((item) => item.id !== id)
                        )
                    })
                    .catch(() => {
                        Swal.fire("Gagal!", "Tidak bisa menghapus data.", "error")
                    })
            }
        })
    }

    // ===================== RENDER ===================== //

    return (
        <Layout>
            <Head
                title={`${title} - ${role.length <= 2
                    ? role.toUpperCase()
                    : role.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />

            <FilterTransaksi
                transaksi={transaksiList}
                data={data}
                setData={setData}
                daftar_tahun={daftar_tahun}
                daftar_bulan={daftar_bulan}
                daftar_rt={daftar_rt}
                daftar_rw={daftar_rw}
                tambahShow={() => setShowTambahPerKk(true)}
                filter={filter}
                resetFilter={resetFilter}
                role={role} // untuk logic internal komponen
            />

            {/* ===================== TABLE ===================== */}
            <div className="table-container">
                <div className="table-header">
                    <h4>
                        {role === "admin"
                            ? "Semua Transaksi"
                            : role === "rw"
                                ? `Transaksi RW ${user?.rw?.nomor_rw}`
                                : `Transaksi RT ${user?.rt?.nomor_rt}`}
                    </h4>
                    <span></span>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="text-center" scope="col">No.</th>
                                <th className="text-center" scope="col">No. KK</th>
                                <th className="text-center" scope="col">Tanggal</th>
                                <th className="text-center" scope="col">Nama</th>
                                <th className="text-center" scope="col">Jenis</th>
                                <th className="text-center" scope="col">Nominal</th>
                                <th className="text-center" scope="col">Keterangan</th>
                                <th className="text-center" scope="col">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {transaksiList.length > 0 ? (
                                transaksiList.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">
                                            {item.no_kk ?? "Semua KK"}
                                        </td>
                                        <td className="text-center">
                                            {formatTanggal(item.tanggal)}
                                        </td>
                                        <td className="text-center">
                                            {item.nama_transaksi}
                                        </td>
                                        <td className="text-center">
                                            {item.jenis === "pemasukan" ? (
                                                <span className="badge bg-success text-white">
                                                    Pemasukan
                                                </span>
                                            ) : (
                                                <span className="badge bg-danger text-white">
                                                    Pengeluaran
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-end" style={{ whiteSpace: 'nowrap' }}>
                                            {formatRupiah(item.nominal)}
                                        </td>
                                        <td className="text-center">
                                            {item.keterangan ?? "-"}
                                        </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() => modalEdit(item)}
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        Tidak ada transaksi
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transaksiServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {transaksiServer.links.map((link, index) => {
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

            {/* ===================== MODAL ===================== */}

            <TambahTransaksiPerKk
                listKK={list_kk}
                tambahShow={showTambahPerKk}
                onClose={() => setShowTambahPerKk(false)}
                role={role}
                daftarRT={daftar_rt}
                daftarRW={daftar_rw}
                onAdded={(baru) => setTransaksiList((prev) => [baru, ...prev])}
            />

            <EditTransaksi
                editShow={showEdit}
                onClose={() => setShowEdit(false)}
                selectedData={selected}
                role={role}
                onUpdated={(updated) =>
                    setTransaksiList((prev) =>
                        prev.map((item) => (item.id === updated.id ? updated : item))
                    )
                }
            />
        </Layout>
    )
}
