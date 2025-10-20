import Layout from "@/Layouts/Layout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { formatRupiah, formatTanggal } from "../Component/GetPropRole";
import Swal from "sweetalert2";
import { FilterTransaksi } from "../Component/Filter";
import { EditTransaksi, TambahTransaksi } from "../Component/Modal";
import axios from "axios";

export default function Transaksi() {
    const { title, transaksi: transaksiFromServer, daftar_tahun, daftar_bulan, daftar_rt } = usePage().props;
    const { props } = usePage();
    const role = props.auth?.currentRole;
    const user = props.auth?.user;

    const [transaksiList, setTransaksiList] = useState(transaksiFromServer.data || []);
    const [selected, setSelected] = useState(null);
    const [showModalTambah, setShowModalTambah] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);

    const { get, data, setData } = useForm({
        search: "",
        tahun: "",
        bulan: "",
        rt: "",
    });

    const modalEdit = (tableData) => {
        setSelected(tableData);
        setShowModalEdit(true);
    };

    useEffect(() => {
        setTransaksiList(transaksiFromServer.data);
    }, [transaksiFromServer]);

    const filter = (e) => {
        e.preventDefault();
        get(`/rw/transaksi`, { preserveState: true, preserveScroll: true });
    };

    const resetFilter = () => {
        setData({
            search: "",
            tahun: "",
            bulan: "",
            rt: "",
        });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Yakin hapus transaksi ini?",
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`/rw/transaksi/${id}`)
                    .then(() => {
                        Swal.fire("Terhapus!", "Data Transaksi berhasil dihapus.", "success");
                        setTransaksiList(prev => prev.filter(item => item.id !== id));
                    })
                    .catch(() => {
                        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
                    });
            }
        });
    };

    return (
        <Layout>
            <Head title={`${title} - RW ${user.rw?.nomor_rw}`} />

            <FilterTransaksi
                data={data}
                setData={setData}
                daftar_tahun={daftar_tahun}
                daftar_bulan={daftar_bulan}
                daftar_rt={daftar_rt}
                filter={filter}
                resetFilter={resetFilter}
                tambahShow={() => setShowModalTambah(true)}
                role="rw"
            />

            <div className="table-container">
                <div className="table-header">
                    <h4>Data Transaksi RW {user.rw?.nomor_rw}</h4>
                    <span></span>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>RT</th>
                                <th>Tanggal</th>
                                <th>Nama</th>
                                <th>Jenis</th>
                                <th>Nominal</th>
                                <th>Keterangan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksiList.length > 0 ? (
                                transaksiList.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.rt ?? "-"}</td>
                                        <td className="text-center">{formatTanggal(item.tanggal) ?? "-"}</td>
                                        <td>{item.nama_transaksi ?? "-"}</td>
                                        <td className="text-center">
                                            {item.jenis === "pemasukan" ? (
                                                <span className="badge bg-success text-white">Pemasukan</span>
                                            ) : (
                                                <span className="badge bg-danger text-white">Pengeluaran</span>
                                            )}
                                        </td>
                                        <td className="text-right">{formatRupiah(item.nominal) ?? "-"}</td>
                                        <td>{item.keterangan ?? "-"}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button className="btn btn-sm btn-warning" title="Edit" onClick={() => modalEdit(item)}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger" title="Hapus" onClick={() => handleDelete(item.id)}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="20" className="text-center">Tidak ada data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <TambahTransaksi
                tambahShow={showModalTambah}
                onClose={() => setShowModalTambah(false)}
                onAdded={(baru) => setTransaksiList(prev => [baru, ...prev])}
                role="rw"
            />
            <EditTransaksi
                editShow={showModalEdit}
                onClose={() => setShowModalEdit(false)}
                onUpdated={(updated) => {
                    setTransaksiList(prev => prev.map(item => item.id === updated.id ? updated : item));
                }}
                role="rw"
                selectedData={selected}
            />
        </Layout>
    );
}
