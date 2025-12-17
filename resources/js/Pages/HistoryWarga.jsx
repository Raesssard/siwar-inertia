import React from "react"
import { Head, Link, usePage } from "@inertiajs/react"
import Layout from "@/Layouts/Layout"

export default function HistoryWarga({ title, historyWarga }) {
    const { props } = usePage()
    const role = props.auth?.currentRole

    return (
        <Layout>
            <Head
                title={`${title} - ${role?.length <= 2
                    ? role.toUpperCase()
                    : role?.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />

            <div className="table-container">
                <div className="table-header">
                    <h4>{title}</h4>
                </div>

                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center">No</th>
                                <th className="px-3 text-center">NIK</th>
                                <th className="px-3 text-center">Nama</th>
                                <th className="px-3 text-center">Jenis</th>
                                <th className="px-3 text-center">Keterangan</th>
                                <th className="px-3 text-center">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyWarga.data.length > 0 ? (
                                historyWarga.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">
                                            {historyWarga.from + index}
                                        </td>
                                        <td className="text-center">
                                            {item.warga_nik}
                                        </td>
                                        <td className="text-center">
                                            {item.nama}
                                        </td>
                                        <td className="text-center text-capitalize">
                                            {item.jenis}
                                        </td>
                                        <td className="text-center">
                                            {item.keterangan ?? "-"}
                                        </td>
                                        <td className="text-center">
                                            {item.tanggal}
                                        </td>
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

                {/* Pagination */}
                {historyWarga.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {historyWarga.links.map((link, index) => {
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
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </Layout>
    )
}
