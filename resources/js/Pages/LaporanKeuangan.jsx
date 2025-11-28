import Layout from "@/Layouts/Layout"
import { Head, Link, useForm, usePage } from "@inertiajs/react"
import React, { useEffect, useState } from "react"
import { formatRupiah, formatTanggal } from "./Component/GetPropRole"
import { FilterLaporanKeuangan } from "./Component/Filter"

export default function LaporanKeuangan() {
    const {
        title,
        pemasukan: pemasukanFromServer,
        pengeluaran: pengeluaranFromServer,
        transaksi: transaksiFromServer,
        daftar_tahun,
        daftar_bulan,
        totalPemasukan,
        totalPengeluaran,
        totalKeuangan,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth.currentRole
    const user = props.auth.user
    const [pemasukan, setPemasukan] = useState(pemasukanFromServer?.data || [])
    const [pengeluaran, setPengeluaran] = useState(pengeluaranFromServer?.data || [])
    const [transaksi, setTransaksi] = useState(transaksiFromServer?.data || [])
    const { get, data, setData, reset } = useForm({
        search: '',
        tahun: '',
        bulan: '',
        jenis: '',
    })
    const tahunIni = new Date().getFullYear()
    const bulanIni = daftar_bulan.find((b, index) => index + 1 == new Date().getMonth() + 1)
    const [bulan, setBulan] = useState(bulanIni)
    const [tahun, setTahun] = useState(new Date().getFullYear())

    const filter = (e) => {
        setBulan(() => {
            if (data.bulan) {
                return daftar_bulan.find((b, index) => index + 1 == data.bulan)
            } else {
                return bulanIni
            }
        })
        setTahun(data.tahun || tahunIni)
        e.preventDefault()
        get('/laporan-keuangan', { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        reset()
        setTahun(tahunIni)
        setBulan(bulanIni)
    }

    useEffect(() => {
        const bulanTerpilih = daftar_bulan[data.bulan - 1] || bulanIni
        setBulan(bulanTerpilih)
    }, [transaksiFromServer])

    useEffect(() => {
        setTransaksi(transaksiFromServer.data)
    }, [transaksiFromServer])

    const batasNominal = {
        borderLeft: '1px solid lightGray',
        borderRight: '1px solid lightGray'
    }

    const formatKeterangan = () => {
        if (!bulan) return tahun === tahunIni ? "ini" : tahun

        const bulanUpper = bulan.replace(/\b\w/g, char => char.toUpperCase())

        if (bulan === bulanIni && tahun === tahunIni) {
            return "ini"
        }

        if (tahun === tahunIni) {
            return bulanUpper
        }

        return `${bulanUpper} ${tahun}`
    }

    const keteranganBulan = formatKeterangan()

    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterLaporanKeuangan
                transaksi={transaksi}
                data={data}
                setData={setData}
                daftar_tahun={daftar_tahun}
                daftar_bulan={daftar_bulan}
                tahunIni={tahunIni}
                bulanIni={bulanIni}
                filter={filter}
                resetFilter={resetFilter}
                role={role}
            />
            <div className="table-container" style={{ maxHeight: 'none', height: '60vh' }}>
                <div className="table-header">
                    <h4>Laporan Keuangan{' '}
                        {
                            role === 'rt'
                                ? `RT ${user.rukun_tetangga.nomor_rt}`
                                : role === 'rw'
                                    ? `RW ${user.rw.nomor_rw}`
                                    : ''
                        }
                    </h4>
                </div>
                <div className="table-scroll" style={{ maxHeight: '40vh', height: '40vh' }}>
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col">No.</th>
                                <th className="px-3 text-center" scope="col">Tanggal</th>
                                <th className="px-3 text-center" scope="col">Nama</th>
                                {/* <th className="px-3 text-center" scope="col">Jenis</th> */}
                                <th className="px-3 text-center" style={batasNominal} scope="col">Pemasukan</th>
                                <th className="px-3 text-center" style={batasNominal} scope="col">Pengeluaran</th>
                                <th className="px-3 text-center" style={batasNominal} scope="col">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksi?.length > 0 ? (
                                <>
                                    {transaksi.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="text-center">{index + 1}</td>
                                            <td className="text-center">{formatTanggal(item.tanggal)}</td>
                                            <td className="text-center">{item.nama_transaksi ?? '-'}</td>
                                            {/* <td className="text-center">
                                                {item.jenis === 'pemasukan' ? (
                                                    <span className="badge bg-success text-white">Pemasukan</span>
                                                ) : (
                                                    <span className="badge bg-danger text-white">Pengeluaran</span>
                                                )}
                                            </td> */}
                                            <td className="text-end" style={batasNominal}>{item.jenis === 'pemasukan' ? formatRupiah(item.nominal) : '-'}</td>
                                            <td className="text-end" style={batasNominal}>{item.jenis === 'pengeluaran' ? formatRupiah(item.nominal) : '-'}</td>
                                            <td style={{ ...batasNominal, borderBottom: 'none', borderTop: 'none' }}></td>
                                        </tr>
                                    ))}

                                </>
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">Tidak ada data</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="text-start" style={{ fontWeight: '500' }}>Total Keuangan Bulan {keteranganBulan}</td>
                                <td className="text-end" style={batasNominal}>{totalPemasukan ? formatRupiah(totalPemasukan) : '-'}</td>
                                <td className="text-end" style={batasNominal}>{totalPengeluaran ? formatRupiah(totalPengeluaran) : '-'}</td>
                                <td className="text-end" style={batasNominal}>{totalKeuangan ? formatRupiah(totalKeuangan) : '-'}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {transaksiFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {transaksiFromServer.links.map((link, index) => {
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
            {/* <div className="table-container">
                <div className="table-header">
                    <h4>Keuangan RT {user.rukun_tetangga.nomor_rt}</h4>
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
                            {pengeluaran?.length > 0 ? (
                                pengeluaran?.map((item, index) => (
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
                                    <td colSpan="4" className="text-center">
                                        Tidak ada data
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {pengeluaranFromServer.links && (
                    <div className="pagination-container">
                        <ul className="pagination-custom">
                            {pengeluaranFromServer.links.map((link, index) => {
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
            </div> */}
        </Layout >
    )
}