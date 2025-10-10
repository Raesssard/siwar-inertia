import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useState } from "react"
import { FilterKK } from "../Component/Filter"
import { DetailKK } from "../Component/Modal"
import '../../../css/kk.css'

export default function KartuKeluarga() {
    const {
        kartu_keluarga,
        kategori_iuran,
        warga,
        title,
        total_kk,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const { get, data, setData } = useForm({
        search: '',
    })
    const [showModal, setShowModal] = useState(false)
    const [selected, setSelected] = useState(null)

    const modalDetail = (item) => {
        setSelected(item)
        setShowModal(true)
    }

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/kartu_keluarga`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
            jenis_kelamin: ''
        })
    }

    return (
        <Layout>
            <Head title={`${title} ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`}
            />
            <FilterKK
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Data Kartu Keluarga</h4>
                    <span></span>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">NOMOR KK</th>
                                <th className="px-3 text-center" scope="col">KEPALA KELUARGA</th>
                                <th className="px-3 text-center" scope="col">ALAMAT</th>
                                <th className="px-3 text-center" scope="col">NOMOR RT</th>
                                <th className="px-3 text-center" scope="col">NOMOR RW</th>
                                <th className="px-3 text-center" scope="col">KATEGORI IURAN</th>
                                <th className="px-3 text-center" scope="col">DETAIL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kartu_keluarga.data.length > 0 ? (
                                kartu_keluarga.data.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{item.no_kk ?? '-'}</td>
                                        <td className="text-center">
                                            {item.warga[index]?.status_hubungan_dalam_keluarga === 'kepala keluarga'
                                                ? item.warga[index]?.nama : '-'}
                                        </td>
                                        <td className="text-center">{item.alamat ?? '-'}</td>
                                        <td className="text-center">{item.rukun_tetangga?.nomor_rt ?? '-'}</td>
                                        <td className="text-center">{item.rw?.nomor_rw ?? '-'}</td>
                                        <td className="text-center">{item.kategori_golongan?.jenis.charAt(0).toUpperCase() + item.kategori_golongan?.jenis.slice(1) ?? '-'}</td>
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
                {kartu_keluarga.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {kartu_keluarga.links.map((link, index) => {
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
                <DetailKK
                    selectedData={selected}
                    detailShow={showModal}
                    onClose={() => setShowModal(false)}
                    role={role}
                />
            </div>
        </Layout>
    )
}