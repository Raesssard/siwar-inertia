import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { FilterWarga } from "../Component/Filter"
import { formatTanggal } from "../Component/GetPropRole"
import { DetailWarga } from "../Component/Modal"

export default function DataWarga() {
    const {
        title,
        warga,
        total_warga
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const { get, data, setData } = useForm({
        search: '',
        jenis_kelamin: ''
    })
    const [showModal, setShowModal] = useState(false)
    const [selected, setSelected] = useState(null)

    const modalDetail = (item) => {
        setSelected(item)
        setShowModal(true)
    }

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/warga`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
            jenis_kelamin: ''
        })
    }

    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterWarga
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
                total_warga={total_warga}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Warga</h4>
                    <span></span>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">NIK</th>
                                <th className="px-3 text-center" scope="col">NO KK</th>
                                <th className="px-3 text-center" scope="col">NAMA LENGKAP</th>
                                <th className="px-3 text-center" scope="col">JENIS KELAMIN</th>
                                <th className="px-3 text-center" scope="col">TEMPAT LAHIR</th>
                                <th className="px-3 text-center" scope="col">TANGGAL LAHIR</th>
                                <th className="px-3 text-center" scope="col">AGAMA</th>
                                <th className="px-3 text-center" scope="col">STATUS WARGA</th>
                                <th className="px-3 text-center" scope="col">RT</th>
                                <th className="px-3 text-center" scope="col">DETAIL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warga.data.length > 0 ? (
                                warga.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.nik ?? '-'}</td>
                                        <td className="text-center">{item.no_kk ?? '-'}</td>
                                        <td className="text-center">{item.nama ?? '-'}</td>
                                        <td className="text-center">{item.jenis_kelamin.charAt(0).toUpperCase() + item.jenis_kelamin.slice(1) ?? '-'}</td>
                                        <td className="text-center">{item.tempat_lahir ?? '-'}</td>
                                        <td className="text-center">{formatTanggal(item.tanggal_lahir) ?? '-'}</td>
                                        <td className="text-center">{item.agama ?? '-'}</td>
                                        <td className="text-center">
                                            {item.status_warga === 'penduduk' ? (
                                                <span className="badge bg-success text-white">Penduduk</span>
                                            ) : (
                                                <span className="badge bg-primary text-white">pendatang</span>
                                            )}
                                        </td>
                                        <td className="text-center">{item.kartu_keluarga.rukun_tetangga.nomor_rt}</td>
                                        <td className="text-center">
                                            <button className="btn btn-success btn-sm" onClick={() => modalDetail(item)}>
                                                <i className="fas fa-info"></i>
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
                {warga.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {warga.links.map((link, index) => {
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
                <DetailWarga
                    selectData={selected}
                    detailShow={showModal}
                    onClose={() => setShowModal(false)}
                />
            </div>
        </Layout>
    )
}