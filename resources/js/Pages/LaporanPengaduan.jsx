import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useEffect, useState } from "react"
import { formatTanggal } from "./Component/GetPropRole"
import { FilterLaporanPengaduan } from "./Component/Filter";
import Role from "./Component/Role";

export default function InformasiPengaduan() {
    const {
        title,
        pengaduan: pengaduanFromServer,
        daftar_tahun,
        daftar_bulan,
    } = usePage().props;
    const { props } = usePage()
    const role = props.auth.currentRole
    const user = props.auth.user
    const [pengaduan, setPengaduan] = useState(pengaduanFromServer?.data || [])
    const { get, data, setData } = useForm({
        search: '',
        tahun: '',
        bulan: '',
        kategori: '',
        status: '',
    })

    const filter = (e) => {
        e.preventDefault()
        get('/laporan-pengaduan', { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
            tahun: '',
            bulan: '',
            kategori: '',
            status: '',
        })
    }

    useEffect(() => {
        setPengaduan(pengaduanFromServer.data)
    }, [pengaduanFromServer])

    const handleExportLaporan = (e) => {
        e.preventDefault()

        // let bulanExport = bulanIni.bulan == bulan.bulan ? bulan.bulan : data.bulan

        // let nama_bulan = daftar_bulan.find((b, index) => index + 1 == bulanExport)

        // window.location.href = `/export/laporan-keuangan/${bulanExport}/${data.tahun}`

        axios({
            url: "/export/laporan-pengaduan",
            method: "GET",
            params: {
                search: data.search,
                tahun: data.tahun,
                bulan: data.bulan,
                kategori: data.kategori,
                status: data.status,
            },
            responseType: "blob"
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement("a")
                link.href = url
                const fileName =
                    role === 'admin'
                        ? 'laporan-pengaduan-semua-rw'
                        : role === 'rt'
                            ? `laporan-pengaduan-rt${user?.rukun_tetangga?.nomor_rt}-rw${user?.rw?.nomor_rw}`
                            : `laporan-pengaduan-rw${user?.rw?.nomor_rw}`;

                link.setAttribute("download", `${fileName}.xlsx`);

                document.body.appendChild(link)
                link.click()
                link.remove() // bersih2
            })
            .catch((err) => console.error(err))
    }

    const handleExportLaporanPdf = (e) => {
        e.preventDefault()

        // let bulanExport = bulanIni.bulan == bulan.bulan ? bulan.bulan : data.bulan

        // let nama_bulan = daftar_bulan.find((b, index) => index + 1 == bulanExport)

        // window.location.href = "/export/laporan-pengaduan-pdf"

        axios({
            url: "/export/laporan-pengaduan-pdf",
            method: "GET",
            params: {
                search: data.search,
                tahun: data.tahun,
                bulan: data.bulan,
                kategori: data.kategori,
                status: data.status,
            },
            responseType: "blob"
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement("a")
                link.href = url
                const fileName =
                    role === 'admin'
                        ? 'laporan-pengaduan-semua-rw'
                        : role === 'rt'
                            ? `laporan-pengaduan-rt${user?.rukun_tetangga?.nomor_rt}-rw${user?.rw?.nomor_rw}`
                            : `laporan-pengaduan-rw${user?.rw?.nomor_rw}`;

                link.setAttribute("download", `${fileName}.pdf`);

                document.body.appendChild(link)
                link.click()
                link.remove() // bersih2
            })
            .catch((err) => console.error(err))
    }

    return (
        <Layout>
            <Head
                title={`${title} - ${role.length <= 2
                    ? role.toUpperCase()
                    : role.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />
            <FilterLaporanPengaduan
                pengaduan={pengaduan}
                data={data}
                setData={setData}
                exportExcel={handleExportLaporan}
                exportPdf={handleExportLaporanPdf}
                daftar_tahun={daftar_tahun}
                daftar_bulan={daftar_bulan}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
            />
            <div className="table-container">
                <div className="table-header">
                    <h4>Laporan Pengaduan Warga{' '}
                        {
                            role === 'rt'
                                ? `RT ${user.rukun_tetangga.nomor_rt}/RW ${user.rw.nomor_rw}`
                                : role === 'rw'
                                    ? `RW ${user.rw.nomor_rw}`
                                    : ''
                        }
                    </h4>
                </div>
                <div className="table-scroll">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Tanggal</th>
                                <th className="px-3 text-center" scope="col">NIK</th>
                                <th className="px-3 text-center" scope="col">Nama Pelapor</th>
                                <th className="px-3 text-center" scope="col">Aduan</th>
                                <Role role={['admin', 'rw']}>
                                    <th className="px-3 text-center" scope="col">Tujuan</th>
                                </Role>
                                <th className="px-3 text-center" scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pengaduan?.length > 0 ? (
                                pengaduan?.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center">{index + 1}</td>
                                        <td className="text-center">{formatTanggal(item.created_at)}</td>
                                        <td className="text-center">{item.nik_warga ?? '-'}</td>
                                        <td className="text-center">{item.warga.nama ?? '-'}</td>
                                        <td className="text-center">{item.judul ?? '-'}</td>
                                        <Role role={['admin', 'rw']}>
                                            <td className="text-center">{item.level.toUpperCase() ?? '-'}</td>
                                        </Role>
                                        <td className="text-center">
                                            {item.status === 'selesai' ? (
                                                <span className="badge bg-success text-white">Selesai</span>
                                            ) : item.status === 'diproses' ? (
                                                <span className="badge bg-warning text-white">Sedang diproses</span>
                                            ) : (
                                                <span className="badge bg-danger text-white">Belum</span>
                                            )}
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
                {pengaduanFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {pengaduanFromServer.links.map((link, index) => {
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
                                            dangerouslySetInnerHTML={{
                                                __html: label,
                                            }}
                                            title={`Pergi ke halaman ${label === "&lt;" ? 'sebelumnya' : label === "&gt;" ? 'selanjutnya' : label}`}
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