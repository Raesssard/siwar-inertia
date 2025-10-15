import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"

export default function Tagihan() {
    const {
        title,
        tagihanManual,
        tagihanOtomatis,
        kartuKeluargaForFilter
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole

    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
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
                            {tagihanManual.data?.length > 0 ? (
                                tagihanManual.data?.map((item, index) => (
                                    <tr key={item.id}>{console.log(item)}
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
                                                <button className="btn btn-sm btn-warning my-auto" title="Edit Tagihan" onClick={() => console.log('edit tagihan?? kykny')}>
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger my-auto" title="Hapus Tagihan" onClick={() => console.log('delete tagihan?? kykny')}>
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
                {tagihanManual.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {tagihanManual.links.map((link, index) => {
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
                            {tagihanOtomatis.data?.length > 0 ? (
                                tagihanOtomatis.data?.map((item, index) => (
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
                                            <button className="btn btn-sm btn-danger my-auto" title="Hapus Iuran" onClick={() => console.log('delete tagihan?? kykny')}>
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
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
                {tagihanOtomatis.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {tagihanOtomatis.links.map((link, index) => {
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