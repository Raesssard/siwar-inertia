import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React from "react";
import { FilterTransaksi } from "../Component/Filter";
import { formatRupiah, formatTanggal } from "../Component/GetPropRole";

export default function Transaksi() {
    const {
        title,
        transaksi,
        daftar_tahun,
        daftar_bulan
    } = usePage().props
    const { props } = usePage()
    const { get, data, setData } = useForm({
        search: '',
        tahun: '',
        bulan: '',
    })

    const role = props.auth?.currentRole

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
                role={role}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Transaksi RT/RW</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Tanggal</th>
                                <th className="px-3 text-center" scope="col">Jenis</th>
                                <th className="px-3 text-center" scope="col">Nama Transaksi</th>
                                <th className="px-3 text-center" scope="col">Keterangan</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksi.data.length > 0 ? (
                                transaksi.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{formatTanggal(item.tanggal)}</td>
                                        <td className="text-center">
                                            {item.jenis === 'pemasukan' ? (
                                                <span className="badge bg-success text-white">Pemasukan</span>
                                            ) : (
                                                <span className="badge bg-danger text-white">Pengeluaran</span>
                                            )}
                                        </td>
                                        <td className="text-left">{item.nama_transaksi}</td>
                                        <td className="text-left">{item.keterangan}</td>
                                        <td className="text-right">{formatRupiah(item.nominal)}</td>
                                    </tr>
                                ))
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
                {transaksi.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {transaksi.links.map((link, index) => {
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
        </Layout>
    )
}