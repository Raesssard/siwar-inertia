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
        getBulan,
        getTahun,
    } = usePage().props
    const { props } = usePage()
    const role = props.auth.currentRole
    const user = props.auth.user
    const [pemasukan, setPemasukan] = useState(pemasukanFromServer?.data || [])
    const [pengeluaran, setPengeluaran] = useState(pengeluaranFromServer?.data || [])
    const [transaksi, setTransaksi] = useState(transaksiFromServer?.data || [])
    const bulanIni = {
        bulan: new Date().getMonth() + 1,
        nama_bulan: daftar_bulan[new Date().getMonth()]
    }
    const tahunIni = new Date().getFullYear()
    const [tahun, setTahun] = useState(getTahun[0]?.tahun || new Date().getFullYear())
    const defaultBulan = getBulan[0]
        ? { bulan: getBulan[0].bulan, nama_bulan: getBulan[0].nama_bulan }
        : bulanIni

    const [bulan, setBulan] = useState(defaultBulan)
    const { get, data, setData, reset } = useForm({
        search: '',
        tahun: tahun || '',
        bulan: bulanIni.bulan == bulan.bulan ? '' : bulan.bulan,
        jenis: '',
    })

    const formatKeterangan = () => {
        if (!bulan) return tahun === tahunIni ? "ini" : tahun
        const namaBulan = bulan.nama_bulan

        let bulanUpper = namaBulan

        if (!namaBulan) {
            bulanUpper = bulan
        }

        if (bulan.bulan === bulanIni.bulan && tahun === tahunIni) {
            return "ini"
        }

        if (tahun === tahunIni) {
            return bulanUpper.replace(/\b\w/g, char => char.toUpperCase())
        }

        return `${bulanUpper} ${tahun}`
    }

    const keteranganBulan = formatKeterangan()

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

    const daftarBulanObj = daftar_bulan.map((nama, index) => ({
        bulan: index + 1,
        nama_bulan: nama
    }))

    const handleChangeBulan = (e) => {
        const value = Number(e.target.value)
        const bulanObj = daftarBulanObj.find(b => b.bulan === value)

        // setBulan(bulanObj || null)
        setData("bulan", value)
    }

    useEffect(() => {
        if (typeof bulan === "string") {
            const num = daftar_bulan.indexOf(bulan) + 1
            setBulan({ bulan: num, nama_bulan: bulan })
        }
    }, [bulan])

    const handleExportLaporan = (e) => {
        e.preventDefault()

        let bulanExport = bulanIni.bulan == bulan.bulan ? bulan.bulan : data.bulan

        let nama_bulan = daftar_bulan.find((b, index) => index + 1 == bulanExport)

        // window.location.href = `/export/laporan-keuangan/${bulanExport}/${data.tahun}`

        axios({
            url: `/export/laporan-keuangan/${bulanExport}/${data.tahun}`,
            method: "GET",
            responseType: "blob"
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement("a")
                link.href = url
                link.setAttribute(
                    "download",
                    `laporan-keuangan-${role === 'rt'
                        ? `rt${user.rukun_tetangga.nomor_rt}-rw${user.rw.nomor_rw}`
                        : `rw${user.rw.nomor_rw}`
                    }-${nama_bulan}-${data.tahun}.xlsx`
                )
                document.body.appendChild(link)
                link.click()
                link.remove() // bersih2
            })
            .catch((err) => console.error(err))
    }

    const handleExportLaporanPdf = (e) => {
        e.preventDefault()

        let bulanExport = bulanIni.bulan == bulan.bulan ? bulan.bulan : data.bulan

        let nama_bulan = daftar_bulan.find((b, index) => index + 1 == bulanExport)

        // window.location.href = `/export/laporan-keuangan-pdf/${bulanExport}/${data.tahun}`

        axios({
            url: `/export/laporan-keuangan-pdf/${bulanExport}/${data.tahun}`,
            method: "GET",
            responseType: "blob"
        })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement("a")
                link.href = url
                link.setAttribute(
                    "download",
                    `laporan-keuangan-${role === 'rt'
                        ? `rt${user.rukun_tetangga.nomor_rt}-rw${user.rw.nomor_rw}`
                        : `rw${user.rw.nomor_rw}`
                    }-${nama_bulan}-${data.tahun}.pdf`
                )
                document.body.appendChild(link)
                link.click()
                link.remove() // bersih2
            })
            .catch((err) => console.error(err))
    }

    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterLaporanKeuangan
                transaksi={transaksi}
                exportExcel={handleExportLaporan}
                exportPdf={handleExportLaporanPdf}
                handleChangeBulan={handleChangeBulan}
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
            <div className="table-container" style={{ maxHeight: '60vh' }}>
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
                <div className="table-scroll" style={{ maxHeight: '40vh' }}>
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th className="px-3 text-center" scope="col" style={{ borderLeft: '1px solid lightGray' }}>No.</th>
                                <th className="px-3 text-center" scope="col">Tanggal</th>
                                <th className="px-3 text-center" scope="col">Keterangan</th>
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
                                            <td className="text-center" style={{ borderLeft: '1px solid lightGray' }}>{index + 1}</td>
                                            <td className="text-center">{formatTanggal(item.tanggal)}</td>
                                            <td className="text-center">{item.nama_transaksi ?? '-'}</td>
                                            {/* <td className="text-center">
                                                {item.jenis === 'pemasukan' ? (
                                                    <span className="badge bg-success text-white">Pemasukan</span>
                                                ) : (
                                                    <span className="badge bg-danger text-white">Pengeluaran</span>
                                                )}
                                            </td> */}
                                            <td className="text-end" style={{ ...batasNominal, whiteSpace: 'nowrap' }}>{item.jenis === 'pemasukan' ? formatRupiah(item.nominal) : ' '}</td>
                                            <td className="text-end" style={{ ...batasNominal, whiteSpace: 'nowrap' }}>{item.jenis === 'pengeluaran' ? formatRupiah(item.nominal) : ' '}</td>
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
                                <td className="text-end" style={batasNominal}>{totalPemasukan ? formatRupiah(totalPemasukan) : ' '}</td>
                                <td className="text-end" style={batasNominal}>{totalPengeluaran ? formatRupiah(totalPengeluaran) : ' '}</td>
                                <td className="text-end" style={batasNominal}>{totalKeuangan ? formatRupiah(totalKeuangan) : ' '}</td>
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