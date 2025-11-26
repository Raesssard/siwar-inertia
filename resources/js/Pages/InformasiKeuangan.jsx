import Layout from "@/Layouts/Layout"
import { Head, Link, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { formatRupiah, formatTanggal } from "./Component/GetPropRole"

export default function InformasiKeuangan() {
    const {
        title,
        pemasukan: pemasukanFromServer,
        pengeluaran: pengeluaranFromServer,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth.currentRole
    const [pemasukan, setPemasukan] = useState(pemasukanFromServer?.data || [])
    const [pengeluaran, setPengeluaran] = useState(pengeluaranFromServer?.data || [])

    console.log(pemasukan)
    console.log(pengeluaran)
    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <div className="table-container">
                <div className="table-header">
                    <h4>Pemasukan</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Nama</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Tanggal</th>
                                <th className="px-3 text-center" scope="col">Jenis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pemasukan?.length > 0 ? (
                                pemasukan?.map((item, index) => (
                                    <tr key={item.id}>{console.log(item)}
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.nama_transaksi ?? '-'}</td>
                                        <td className="text-end px-0">{formatRupiah(item.nominal) ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tanggal)}</td>
                                        <td className="text-center">
                                            {item.jenis === 'pemasukan' ? (
                                                <span className="badge bg-success text-white">Pemasukkan</span>
                                            ) : (
                                                <span className="badge bg-danger text-white">Pengeluaran</span>
                                            )}
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
                {pemasukanFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {pemasukanFromServer.links.map((link, index) => {
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
        </Layout>
    )
}