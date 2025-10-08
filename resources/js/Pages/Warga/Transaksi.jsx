import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import React from "react";
import { FilterTransaksi } from "../Component/Filter";
import { formatRupiah, formatTanggal } from "../Component/GetPropRole";

export default function Transaksi() {
    const { title, transaksi } = usePage().props
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
            <FilterTransaksi
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Transaksi RT/RW</h4>
                </div>

                <table className="table-custom">
                    <thead>
                        <tr>
                            <th scope="col">No.</th>
                            <th scope="col">Tanggal</th>
                            <th scope="col">Jenis</th>
                            <th scope="col">Nama Transaksi</th>
                            <th scope="col">Keterangan</th>
                            <th scope="col">Nominal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaksi.data.length > 0 ? (
                            transaksi.data.map((item, index) => (
                                <tr key={item.id}>
                                    <td>{index + 1}</td>
                                    <td>{formatTanggal(item.tanggal)}</td>
                                    <td>
                                        {item.jenis === 'pemasukan' ? (
                                            <span class="badge bg-success">Pemasukan</span>
                                        ) : (
                                            <span class="badge bg-danger">Pengeluaran</span>
                                        )}
                                    </td>
                                    <td>{item.nama_transaksi}</td>
                                    <td>{item.keterangan}</td>
                                    <td>{formatRupiah(item.nominal)}</td>
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