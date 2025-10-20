import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { FilterTagihan } from "../Component/Filter"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"
import { DetailTagihan } from "../Component/Modal"

export default function Tagihan() {
    const {
        title,
        tagihanSudahDibayar,
        tagihanBelumDibayar
    } = usePage().props
    const { props } = usePage()
    const { get, data, setData } = useForm({
        search: '',
    })
    const [showModal, setShowModal] = useState(false)
    const [selected, setSelected] = useState(null)

    const modalDetail = (item) => {
        setSelected(item)
        setShowModal(true)
    }

    const role = props.auth?.currentRole

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/tagihan`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
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
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Tagihan yang belum dibayar</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Tagihan</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tempo</th>
                                <th className="px-3 text-center" scope="col">Status</th>
                                <th className="px-3 text-center" scope="col">Tanggal Bayar</th>
                                <th className="px-3 text-center" scope="col">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tagihanBelumDibayar.data.length > 0 ? (
                                tagihanBelumDibayar.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.nama}</td>
                                        <td className="text-center">{formatRupiah(item.nominal)}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tempo)}</td>
                                        <td className="text-center">
                                            {item.status_bayar === 'sudah_bayar' ? (
                                                <span className="badge bg-success text-white">Sudah Bayar</span>
                                            ) : (
                                                <span className="badge bg-warning text-white">Belum Bayar</span>
                                            )}
                                        </td>
                                        <td className="text-center">{item.tgl_bayar ? formatTanggal(item.tgl_bayar) : "-"}</td>
                                        <td className="text-center">
                                            <button className="btn btn-success btn-sm" onClick={() => modalDetail(item)}>
                                                <i className="fas fa-info"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {tagihanBelumDibayar.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {tagihanBelumDibayar.links.map((link, index) => {
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

            <div className="table-container">
                <div className="table-header">
                    <h4>Tagihan yang sudah dibayar</h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Tagihan</th>
                                <th className="px-3 text-center" scope="col">Nominal</th>
                                <th className="px-3 text-center" scope="col">Tanggal Tempo</th>
                                <th className="px-3 text-center" scope="col">Status</th>
                                <th className="px-3 text-center" scope="col">Tanggal Bayar</th>
                                <th className="px-3 text-center" scope="col">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tagihanSudahDibayar.data.length > 0 ? (
                                tagihanSudahDibayar.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.nama}</td>
                                        <td className="text-center">{formatRupiah(item.nominal)}</td>
                                        <td className="text-center">{formatTanggal(item.tgl_tempo)}</td>
                                        <td className="text-center">
                                            {item.status_bayar === 'sudah_bayar' ? (
                                                <span className="badge bg-success text-white">Sudah Bayar</span>
                                            ) : (
                                                <span className="badge bg-warning text-white">Belum Bayar</span>
                                            )}
                                        </td>
                                        <td className="text-center">{item.tgl_bayar ? formatTanggal(item.tgl_bayar) : "-"}</td>
                                        <td className="text-center">
                                            <button className="btn btn-success btn-sm" onClick={() => modalDetail(item)}>
                                                <i className="fas fa-info"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {tagihanSudahDibayar.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {tagihanSudahDibayar.links.map((link, index) => {
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
            <DetailTagihan
                selectedData={selected}
                detailShow={showModal}
                onClose={() => setShowModal(false)}
            />
        </Layout>
    )
}