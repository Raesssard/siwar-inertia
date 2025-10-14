import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { FilterIuran } from "../Component/Filter"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"
import { TambahIuran } from "../Component/Modal"
import Swal from "sweetalert2"

export default function Iuran() {
    const {
        iuranOtomatis: iuranOtomatisFromServer,
        iuranManual: iuranManualFromServer,
        golongan_list,
        title,
    } = usePage().props
    const [iuranListOtomatis, setIuranListOtomatis] = useState(iuranOtomatisFromServer.data || [])
    const [iuranListManual, setIuranListManual] = useState(iuranManualFromServer.data || [])
    const [showModalTambah, setShowModalTambah] = useState(false)
    const [showModalEdit, setShowModalEdit] = useState(false)
    const { props } = usePage()
    const role = props.auth?.currentRole
    const user = props.auth?.user
    const { get, data, setData } = useForm({
        search: '',
    })

    const modalEdit = (item) => {
        setSelected(item)
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
            setIuranListOtomatis(prev => ({
                ...prev,
                total: (prev?.total ?? 0) + 1,
                data: [newIuran, ...(prev?.data || [])]
            }))
        } else {
            setIuranListManual(prev => ({
                ...prev,
                total: (prev?.total ?? 0) + 1,
                data: [newIuran, ...(prev?.data || [])]
            }))
        }
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
                axios.delete(`/${role}/iuran/${id}`)
                    .then((res) => {
                        Swal.fire("Terhapus!", "Data iuran berhasil dihapus.", "success");
                        const jenis = res.data?.jenis
                        if (jenis === "otomatis") {
                            setIuranListOtomatis(prev => prev.filter(item => item.id !== id))
                        } else {
                            setIuranListManual(prev => prev.filter(item => item.id !== id))
                        }
                    })
                    .catch(() => {
                        Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
                    });
            }
        });
    };

    console.log(title)
    console.log(showModalTambah)
    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterIuran
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
                tambahShow={() => setShowModalTambah(true)}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Iuran Manual</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Nama</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tagih</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tempo</th>
                                <th className="px-3 text-center" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {iuranListManual.length > 0 ? (
                                iuranListManual.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{formatRupiah(item.nominal) ?? '-'}</td>
                                        <td className="text-center">{item.nama ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tagih) ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tempo) ?? '-'}</td>
                                        <td className="text-center">
                                            <button className="btn btn-sm btn-danger my-auto" title="Hapus Iuran" onClick={() => handleDelete(item.id)}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
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
                {iuranListManual.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {iuranListManual.links.map((link, index) => {
                                let label = link.label;
                                if (label.includes("Previous")) label = "&lt;"
                                if (label.includes("Next")) label = "&gt;"
                                console.log(label)
                                console.log(link.url)
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
                    <h4>Data Iuran Otomatis</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                {golongan_list.map((gol, i) => (
                                    <th className="px-3 text-center" key={i} scope="col">{gol.jenis.charAt(0).toUpperCase() + gol.jenis.slice(1)}</th>
                                ))}
                                <th className="px-3 text-center" scope="col">Nama</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tagih</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tempo</th>
                                <th className="px-3 text-center" scope="col">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {iuranListOtomatis.length > 0 ? (
                                iuranListOtomatis.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        {golongan_list.map((gol, i) => {
                                            const matched = item.iuran_golongan?.find(ig => ig.id_golongan === gol.id);
                                            return (
                                                <td key={i} className="text-center">
                                                    {matched ? formatRupiah(matched.nominal) : '-'}
                                                </td>
                                            );
                                        })}
                                        <td className="text-center">{item.nama ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tagih) ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tempo) ?? '-'}</td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button className="btn btn-sm btn-warning my-auto" title="Edit Iuran" onClick={() => console.log('nanti diisi sama rute edit')}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger my-auto" title="Hapus Iuran" onClick={() => handleDelete(item.id)}>
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
                {iuranListOtomatis.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {iuranListOtomatis.links.map((link, index) => {
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
                <TambahIuran
                    tambahShow={showModalTambah}
                    onClose={() => setShowModalTambah(false)}
                    onAdded={handleAdded}
                    role={role}
                    golongan={golongan_list}
                />
            </div>
        </Layout>
    )
}