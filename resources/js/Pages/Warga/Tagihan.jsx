import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React from "react"
import { FilterTagihan } from "../Component/Filter"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"

export default function Tagihan() {
    const {
        title,
        tagihanManual,
        tagihanOtomatis
    } = usePage().props
    const { props } = usePage()
    const { get, data, setData } = useForm({
        search: '',
    })

    const role = props.auth?.currentRole

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/transaksi`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
        })
    }

    return (
        <Layout>
            <Head title={`${title} ${role.length <= 2
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
                    <h4>Tagihan Manual</h4>
                </div>

                <table className="table-custom">
                    <thead>
                        <tr>
                            <th scope="col">No.</th>
                            <th scope="col">Tagihan</th>
                            <th scope="col">Nominal</th>
                            <th scope="col">Tanggal Tagih</th>
                            <th scope="col">Tanggal Tempo</th>
                            <th scope="col">Status</th>
                            <th scope="col">Tanggal Bayar</th>
                            <th scope="col">Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tagihanManual.data.length > 0 ? (
                            tagihanManual.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.nama}</td>
                                    <td>{formatRupiah(item.nominal)}</td>
                                    <td>{formatTanggal(item.tgl_tagih)}</td>
                                    <td>{formatTanggal(item.tgl_tempo)}</td>
                                    <td>
                                        {item.status_bayar === 'sudah_bayar' ? (
                                            <span className="badge bg-success">Sudah Bayar</span>
                                        ) : (
                                            <span className="badge bg-warning">Belum Bayar</span>
                                        )}
                                    </td>
                                    <td>{item.tgl_bayar ? formatTanggal(item.tgl_bayar) : "-"}</td>
                                    <td>
                                        <button className="btn btn-success btn-sm">
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

                {tagihanManual.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {tagihanManual.links.map((link, index) => {
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
                    <h4>Tagihan Otomatis</h4>
                </div>

                <table className="table-custom">
                    <thead>
                        <tr>
                            <th scope="col">No.</th>
                            <th scope="col">Tagihan</th>
                            <th scope="col">Nominal</th>
                            <th scope="col">Tanggal Tagih</th>
                            <th scope="col">Tanggal Tempo</th>
                            <th scope="col">Status</th>
                            <th scope="col">Tanggal Bayar</th>
                            <th scope="col">Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tagihanOtomatis.data.length > 0 ? (
                            tagihanOtomatis.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{item.nama}</td>
                                    <td>{formatRupiah(item.nominal)}</td>
                                    <td>{formatTanggal(item.tgl_tagih)}</td>
                                    <td>{formatTanggal(item.tgl_tempo)}</td>
                                    <td>
                                        {item.status_bayar === 'sudah_bayar' ? (
                                            <span className="badge bg-success">Sudah Bayar</span>
                                        ) : (
                                            <span className="badge bg-warning">Belum Bayar</span>
                                        )}
                                    </td>
                                    <td>{item.tgl_bayar ? formatTanggal(item.tgl_bayar) : "-"}</td>
                                    <td>
                                        <button className="btn btn-success btn-sm">
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

                {tagihanOtomatis.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {tagihanOtomatis.links.map((link, index) => {
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