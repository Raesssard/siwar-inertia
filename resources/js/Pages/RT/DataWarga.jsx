import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React from "react"
import { FilterWarga } from "../Component/Filter"
import { formatRupiah, formatTanggal } from "../Component/GetPropRole"

export default function DataWarga() {
    const {
        title,
        warga,
        search,
        total_warga
    } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const { get, data, setData } = useForm({
        search: '',
        jenis_kelamin: ''
    })

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
            <Head title={`${title} ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterWarga
                data={data}
                setData={setData}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
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
                                <th className="px-3 text-center" scope="col">PENDIDIKAN</th>
                                <th className="px-3 text-center" scope="col">PEKERJAAN</th>
                                <th className="px-3 text-center" scope="col">GOLONGAN DARAH</th>
                                <th className="px-3 text-center" scope="col">STATUS PERKAWINAN</th>
                                <th className="px-3 text-center" scope="col">HUBUNGAN DALAM KELUARGA</th>
                                <th className="px-3 text-center" scope="col">KEWARGANEGARAAN</th>
                                <th className="px-3 text-center" scope="col">NO. PASPOR</th>
                                <th className="px-3 text-center" scope="col">NO. KITAS / KITAP</th>
                                <th className="px-3 text-center" scope="col">NAMA AYAH</th>
                                <th className="px-3 text-center" scope="col">NAMA IBU</th>
                                <th className="px-3 text-center" scope="col">STATUS WARGA</th>
                                <th className="px-3 text-center" scope="col">RT</th>
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
                                        <td className="text-center">{item.pendidikan ?? '-'}</td>
                                        <td className="text-center">{item.pekerjaan ?? '-'}</td>
                                        <td className="text-center">{item.golongan_darah ?? '-'}</td>
                                        <td className="text-center">{item.status_perkawinan.charAt(0).toUpperCase() + item.status_perkawinan.slice(1) ?? '-'}</td>
                                        <td className="text-center">{item.status_hubungan_dalam_keluarga.charAt(0).toUpperCase() + item.status_hubungan_dalam_keluarga.slice(1) ?? '-'}</td>
                                        <td className="text-center">{item.kewarganegaraan ?? '-'}</td>
                                        <td className="text-center">{item.no_paspor ?? "-"}</td>
                                        <td className="text-center">{item.no_kitas ?? "-"}/{item.no_kitap ?? "-"}</td>
                                        <td className="text-center">{item.nama_ayah ?? '-'}</td>
                                        <td className="text-center">{item.nama_ibu ?? '-'}</td>
                                        <td className="text-center">
                                            {item.status_warga === 'penduduk' ? (
                                                <span className="badge bg-success text-white">Penduduk</span>
                                            ) : (
                                                <span className="badge bg-primary text-white">pendatang</span>
                                            )}
                                        </td>
                                        <td className="text-center">{item.kartu_keluarga.rukun_tetangga.nomor_rt}</td>
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