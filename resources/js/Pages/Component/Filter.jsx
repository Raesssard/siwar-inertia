import React, { useEffect, useRef, useState } from "react"
import { Link } from "@inertiajs/react"
import Role from "./Role"
import { useIsMobile } from "./GetPropRole"
import axios from "axios"

export function FilterPengaduan({ data, setData, list_tahun, list_bulan, list_level, filter, resetFilter, tambahShow, role }) {
    return (
        <form onSubmit={filter} className="form-filter row g-2 pl-3 pb-2 w-100">
            <div className="col-md-5 col-12">
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Pengaduan..."
                    />
                    <button className="btn-filter btn btn-primary" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <div className="col-md-7 col-12 d-flex flex-wrap gap-2">
                <select
                    name="tahun"
                    value={data.tahun}
                    onChange={(e) => setData('tahun', e.target.value)}
                    className="form-select form-select-sm w-auto flex-fill my-2"
                >
                    <option value="">Semua Tahun</option>
                    {list_tahun.map((th) => (
                        <option key={th} value={th}>{th}</option>
                    ))}
                </select>

                <select
                    name="bulan"
                    value={data.bulan}
                    onChange={(e) => setData('bulan', e.target.value)}
                    className="form-select form-select-sm w-auto flex-fill my-2"
                >
                    <option value="">Semua Bulan</option>
                    {list_bulan.map((nama, index) => (
                        <option key={index + 1} value={index + 1}>
                            {nama.charAt(0).toUpperCase() + nama.slice(1)}
                        </option>
                    ))}
                </select>

                <select
                    name="kategori"
                    value={data.kategori}
                    onChange={(e) => setData('kategori', e.target.value)}
                    className="form-select form-select-sm w-auto flex-fill my-2"
                >
                    <option value="">Semua Pengaduan</option>
                    <Role role='warga'>
                        <option value="saya">Pengaduan Saya</option>
                    </Role>
                    {list_level.map((level, index) => (
                        <option key={index} value={level}>Pengaduan {level.toUpperCase()}</option>
                    ))}
                </select>

                <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill" title="Filter Pengaduan" style={{ maxWidth: '3rem' }}>
                    <i className="fas fa-filter"></i>
                </button>
                <Link
                    href={`/${role}/pengaduan`}
                    preserveScroll
                    className="btn-input btn btn-secondary btn-sm flex-fill my-auto"
                    title="Reset"
                    onClick={resetFilter}
                    style={{ maxWidth: '3rem' }}
                >
                    <i className="fas fa-undo"></i>
                </Link>
                <Role role="warga">
                    <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success flex-fill">
                        <i className="fas fa-plus mr-2"></i>
                        Buat Pengaduan
                    </button>
                </Role>
            </div>
        </form>
    )
}

export function FilterPengumuman({ data, setData, daftar_tahun, list_bulan, daftar_kategori, filter, resetFilter, role }) {
    const widthMobile = useIsMobile()
        ? {
            select:
            {
                width: '10.725rem',
                maxWidth: '10.725rem',
            },
            button: {
                // width: '3rem',
                // maxWidth: '3rem',
                margin: '0',
            }
        }
        : {}

    return (
        <form onSubmit={filter} className="form-filter row g-2 mx-auto mb-2 w-100">
            <div className="col-md-5 mb-auto"
                style={
                    useIsMobile()
                        ? { paddingRight: '0.75rem' }
                        : { paddingRight: '0.25rem' }
                }
            >
                <div className="input-group input-group-sm" style={{ height: "3.5rem" }}>
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Judul/Isi/hari..."
                    />
                    <button className="btn-filter btn btn-primary my-0" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <div className="col-md-7 col-12 d-flex flex-wrap gap-2">
                <select
                    name="tahun"
                    value={data.tahun}
                    onChange={(e) => setData('tahun', e.target.value)}
                    className="form-select form-select-sm w-auto flex-fill my-2"
                    style={widthMobile.select}
                >
                    <option value="">Semua Tahun</option>
                    {daftar_tahun.map((th) => (
                        <option key={th} value={th}>
                            {th}
                        </option>
                    ))}
                </select>

                <select
                    name="bulan"
                    value={data.bulan}
                    onChange={(e) => setData('bulan', e.target.value)}
                    className="form-select form-select-sm w-auto flex-fill my-2"
                    style={widthMobile.select}
                >
                    <option value="">Semua Bulan</option>
                    {list_bulan.map((nama, index) => (
                        <option key={index + 1} value={index + 1}>
                            {nama.charAt(0).toUpperCase() + nama.slice(1)}
                        </option>
                    ))}
                </select>

                <select
                    name="kategori"
                    value={data.kategori}
                    onChange={(e) => setData('kategori', e.target.value)}
                    className="form-select form-select-sm w-auto flex-fill my-2"
                    style={widthMobile.select}
                >
                    <option value="">Semua Kategori</option>
                    {daftar_kategori.map((kt) => (
                        <option key={kt} value={kt}>
                            {kt}
                        </option>
                    ))}
                </select>

                <select
                    name="kategori"
                    value={data.level}
                    onChange={(e) => setData('level', e.target.value)}
                    className="form-select form-select-sm w-auto flex-fill my-2"
                    style={widthMobile.select}
                >
                    <option value="">Semua Pengumuman</option>
                    <option value="rt">Pengumuman RT</option>
                    <option value="rw">Pengumuman RW</option>
                </select>

                <button
                    type="submit"
                    className="btn-input btn btn-sm btn-primary flex-fill p-0"
                    title="Filter Pengumuman"
                    style={widthMobile.button}
                >
                    <i className="fas fa-filter mr-2"></i>
                    {useIsMobile() && 'Filter'}
                </button>
                <Link
                    preserveScroll
                    href={`/${role}/pengumuman`}
                    onClick={resetFilter}
                    className="btn-input btn btn-secondary btn-sm flex-fill p-0"
                    title="Reset"
                    style={widthMobile.button}
                >
                    <i className="fas fa-undo mr-2"></i>
                    {useIsMobile() && 'Reset'}
                </Link>
            </div>
        </form>
    )
}

export function FilterTransaksi({ transaksi, data, setData, daftar_tahun, daftar_bulan, daftar_rt, filter, resetFilter, tambahShow, role }) {
    return (
        <form onSubmit={filter} className="filter-form form-filter d-flex px-0 gap-2 pb-2 mb-2 w-100">
            <div className={`${useIsMobile() ? 'mx-2' : 'col-md-5 col-12'}`} style={useIsMobile() ? { width: '100%' } : {}}>
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Transaksi..."
                    />
                    <button className="btn-filter btn btn-primary my-0" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2" style={role === 'warga' ? { maxWidth: "3rem", minWidth: "3rem" } : null}>
                {useIsMobile() ? (
                    <>
                        <div className="w-100 d-flex flex-wrap gap-2 mx-2">
                            <select
                                name="tahun"
                                value={data.tahun}
                                onChange={(e) => setData('tahun', e.target.value)}
                                className="form-select form-select-sm w-auto flex-fill my-2"
                            >
                                <option value="">Semua Tahun</option>
                                {daftar_tahun.map((th) => (
                                    <option key={th} value={th}>
                                        {th}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="bulan"
                                value={data.bulan}
                                onChange={(e) => setData('bulan', e.target.value)}
                                className="form-select form-select-sm w-auto flex-fill my-2"
                            >
                                <option value="">Semua Bulan</option>
                                {daftar_bulan.map((nama, index) => (
                                    <option key={index + 1} value={index + 1}>
                                        {nama.charAt(0).toUpperCase() + nama.slice(1)}
                                    </option>
                                ))}
                            </select>
                            <Role role={['admin', 'rw']}>
                                <select
                                    name="rt"
                                    value={data.rt}
                                    onChange={(e) => setData('rt', e.target.value)}
                                    className="form-select form-select-sm w-auto flex-fill my-2"
                                >
                                    <option value="">Semua RT</option>
                                    {daftar_rt?.map((noRt) => (
                                        <option key={noRt.nomor_rt} value={noRt.nomor_rt}>
                                            RT {noRt.nomor_rt}
                                        </option>
                                    ))}
                                </select>
                            </Role>
                        </div>

                        <div className="w-100 d-flex flex-wrap gap-2 mx-2">
                            <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0 mx-0" title="Filter Transaksi" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                                <i className="fas fa-filter"></i>
                            </button>
                            <Link preserveScroll href={`/${role}/transaksi`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                                <i className="fas fa-undo"></i>
                            </Link>
                            <Role role={['rt', 'rw', 'bendahara', 'admin']}>
                                <button
                                    className="btn btn-success my-auto"
                                    type="button"
                                    title={!transaksi?.length ? "Tidak ada Transaksi yang dapat diexport" : "Export Transaksi ke Excel"}
                                    style={{ borderRadius: "0.2rem" }}
                                    onClick={() => {
                                        // window.location.href = `/${role}/export/transaksi`

                                        axios({
                                            url: `/${role}/export/transaksi`,
                                            method: "GET",
                                            responseType: "blob"
                                        })
                                            .then((response) => {
                                                const url = window.URL.createObjectURL(new Blob([response.data]))
                                                const link = document.createElement("a")
                                                link.href = url
                                                link.setAttribute(
                                                    "download",
                                                    `laporan-transaksi.xlsx`
                                                )
                                                document.body.appendChild(link)
                                                link.click()
                                                link.remove()
                                            })
                                            .catch((err) => console.error(err))
                                    }}
                                    disabled={!transaksi?.length}
                                >
                                    <i className="fas fa-file-excel"></i>
                                </button>
                            </Role>
                            <Role role={['rt', 'rw', 'bendahara', 'admin']}>
                                <div className="text-end ml-auto mr-0">
                                    <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                                        <i className="fas fa-plus mr-2"></i>
                                        Buat Transaksi
                                    </button>
                                </div>
                            </Role>
                        </div>
                    </>
                ) : (
                    <>
                        <select
                            name="tahun"
                            value={data.tahun}
                            onChange={(e) => setData('tahun', e.target.value)}
                            className="form-select form-select-sm w-auto flex-fill my-2"
                        >
                            <option value="">Semua Tahun</option>
                            {daftar_tahun.map((th) => (
                                <option key={th} value={th}>
                                    {th}
                                </option>
                            ))}
                        </select>

                        <select
                            name="bulan"
                            value={data.bulan}
                            onChange={(e) => setData('bulan', e.target.value)}
                            className="form-select form-select-sm w-auto flex-fill my-2"
                        >
                            <option value="">Semua Bulan</option>
                            {daftar_bulan.map((nama, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {nama.charAt(0).toUpperCase() + nama.slice(1)}
                                </option>
                            ))}
                        </select>
                        <Role role={['admin', 'rw']}>
                            <select
                                name="rt"
                                value={data.rt}
                                onChange={(e) => setData('rt', e.target.value)}
                                className="form-select form-select-sm w-auto flex-fill my-2"
                            >
                                <option value="">Semua RT</option>
                                {daftar_rt?.map((noRt) => (
                                    <option key={noRt.nomor_rt} value={noRt.nomor_rt}>
                                        RT {noRt.nomor_rt}
                                    </option>
                                ))}
                            </select>
                        </Role>

                        <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0" title="Filter Transaksi" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                            <i className="fas fa-filter"></i>
                        </button>
                        <Link preserveScroll href={`/${role}/transaksi`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                            <i className="fas fa-undo"></i>
                        </Link>
                        <Role role={['rt', 'rw', 'bendahara', 'admin']}>
                            <button
                                className="btn btn-success my-auto"
                                type="button"
                                title={!transaksi?.length ? "Tidak ada Transaksi yang dapat diexport" : "Export Transaksi ke Excel"}
                                style={{ borderRadius: "0.2rem" }}
                                onClick={() => {
                                    // window.location.href = `/${role}/export/transaksi`

                                    axios({
                                        url: `/${role}/export/transaksi`,
                                        method: "GET",
                                        responseType: "blob"
                                    })
                                        .then((response) => {
                                            const url = window.URL.createObjectURL(new Blob([response.data]))
                                            const link = document.createElement("a")
                                            link.href = url
                                            link.setAttribute(
                                                "download",
                                                `laporan-transaksi.xlsx`
                                            )
                                            document.body.appendChild(link)
                                            link.click()
                                            link.remove()
                                        })
                                        .catch((err) => console.error(err))
                                }}
                                disabled={!transaksi?.length}
                            >
                                <i className="fas fa-file-excel"></i>
                            </button>
                        </Role>
                    </>
                )}
            </div>
            {!useIsMobile() && (<Role role={['rt', 'rw', 'bendahara', 'admin']}>
                <div className="text-end ml-auto mr-3">
                    <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                        <i className="fas fa-plus mr-2"></i>
                        Buat Transaksi
                    </button>
                </div>
            </Role>)}
        </form >
    )
}

export function FilterTagihan({ tagihanManual, tagihanOtomatis, data, setData, filter, resetFilter, role, kk_list, tambahShow }) {
    return (
        <form onSubmit={filter} className="filter-form form-filter d-flex px-0 gap-1 pb-2 mb-2 w-100">
            <div className={`${(useIsMobile() && role === "warga") ? 'ms-2' : useIsMobile() ? 'mx-2' : 'col-md-5 col-12'}`} style={(useIsMobile() && role === 'warga') ? { width: "80%" } : { width: "100%" }}>
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Nama..."
                    />
                    <button className="btn-filter btn btn-primary" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            {role !== "warga" ? (
                <>
                    <div className={`d-flex flex-wrap gap-2 ${useIsMobile() ? "w-100 mx-2" : ""} ${role === 'warga' && "d-none"}`} style={role === 'warga' ? { maxWidth: "3rem", minWidth: "3rem" } : null}>
                        <Role role={['rt', 'rw', 'bendahara', 'admin']}>
                            <div className="d-flex flex-wrap gap-2">
                                <select
                                    name="no_kk_filter"
                                    value={data.no_kk_filter}
                                    onChange={(e) => setData('no_kk_filter', e.target.value)}
                                    className="form-select form-select-sm w-auto flex-fill my-2 mx-0"
                                >
                                    <option value="">Semua Kartu Keluarga</option>
                                    {kk_list?.map((kk) => (
                                        <option key={kk.no_kk} value={kk.no_kk}>
                                            {kk.no_kk}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="form-select form-select-sm w-auto flex-fill my-2 mx-0"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="sudah_bayar">Sudah Bayar</option>
                                    <option value="belum_bayar">Belum Bayar</option>
                                    <option value="sudah_lunas">Sudah Lunas</option>
                                    <option value="belum_lunas">Belum Lunas</option>
                                </select>
                            </div>
                        </Role>
                    </div>

                    <div className={`d-flex flex-wrap gap-2 ${useIsMobile() ? "w-100 mx-2" : ""}`}>
                        <Role role={['bendahara', 'rt', 'rw', 'admin']}>
                            <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0 mx-0" title="Filter Tagihan" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                                <i className="fas fa-filter"></i>
                            </button>
                        </Role>

                        <Role isnRole={'warga'}>
                            <Link preserveScroll href={`/${role}/tagihan`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                                <i className="fas fa-undo"></i>
                            </Link>
                        </Role>

                        <Role role={['bendahara', 'rt', 'rw', 'admin']}>
                            <button
                                className="btn btn-success my-auto mr-3"
                                type="button"
                                title={!tagihanManual?.length && !tagihanOtomatis?.length ? "Tidak ada Tagihan yang dapat diexport" : "Export Tagihan ke Excel"}
                                style={{ borderRadius: "0.2rem" }}
                                onClick={() => {
                                    // window.location.href = `/${role}/export/tagihan`

                                    axios({
                                        url: `/${role}/export/tagihan`,
                                        method: "GET",
                                        responseType: "blob"
                                    })
                                        .then((response) => {
                                            const url = window.URL.createObjectURL(new Blob([response.data]))
                                            const link = document.createElement("a")
                                            link.href = url
                                            link.setAttribute(
                                                "download",
                                                `laporan-tagihan.xlsx`
                                            )
                                            document.body.appendChild(link)
                                            link.click()
                                            link.remove() // bersih2
                                        })
                                        .catch((err) => console.error(err))
                                }}
                                disabled={!tagihanManual?.length && !tagihanOtomatis?.length}
                            >
                                <i className="fas fa-file-excel"></i>
                            </button>
                        </Role>

                        {useIsMobile() && (
                            <Role role={['bendahara', 'rt', 'rw', 'admin']}>
                                <div className="text-end ml-auto">
                                    <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                                        <i className="fas fa-plus mr-2"></i>
                                        Tambah Tagihan
                                    </button>
                                </div>
                            </Role>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* <div className={`d-flex flex-wrap gap-2 ${useIsMobile() ? "w-100 mx-2" : ""} ${role === 'warga' && "d-none"}`} style={role === 'warga' ? { maxWidth: "3rem", minWidth: "3rem" } : null}> */}
                    <Role role={['rt', 'rw', 'bendahara', 'admin']}>
                        <div className="d-flex flex-wrap gap-2">
                            <select
                                name="no_kk_filter"
                                value={data.no_kk_filter}
                                onChange={(e) => setData('no_kk_filter', e.target.value)}
                                className="form-select form-select-sm w-auto flex-fill my-2 mx-0"
                            >
                                <option value="">Semua Kartu Keluarga</option>
                                {kk_list?.map((kk) => (
                                    <option key={kk.no_kk} value={kk.no_kk}>
                                        {kk.no_kk}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="status"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="form-select form-select-sm w-auto flex-fill my-2 mx-0"
                            >
                                <option value="">Semua Status</option>
                                <option value="sudah_bayar">Sudah Bayar</option>
                                <option value="belum_bayar">Belum Bayar</option>
                                <option value="sudah_lunas">Sudah Lunas</option>
                                <option value="belum_lunas">Belum Lunas</option>
                            </select>
                        </div>
                    </Role>
                    {/* </div> */}

                    {/* <div className={`d-flex flex-wrap gap-2 ${useIsMobile() && "w-100"} ${role === 'warga' && "d-none"}`}> */}
                    <Role role={['bendahara', 'rt', 'rw', 'admin']}>
                        <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0 mx-0" title="Filter Tagihan" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                            <i className="fas fa-filter"></i>
                        </button>
                    </Role>

                    <Role isnRole={'warga'}>
                        <Link preserveScroll href={`/${role}/tagihan`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                            <i className="fas fa-undo"></i>
                        </Link>
                    </Role>

                    <Role role={['bendahara', 'rt', 'rw', 'admin']}>
                        <button
                            className="btn btn-success my-auto mr-3"
                            type="button"
                            title={!tagihanManual?.length && !tagihanOtomatis?.length ? "Tidak ada Tagihan yang dapat diexport" : "Export Tagihan ke Excel"}
                            style={{ borderRadius: "0.2rem" }}
                            onClick={() => {
                                // window.location.href = `/${role}/export/tagihan`

                                axios({
                                    url: `/${role}/export/tagihan`,
                                    method: "GET",
                                    responseType: "blob"
                                })
                                    .then((response) => {
                                        const url = window.URL.createObjectURL(new Blob([response.data]))
                                        const link = document.createElement("a")
                                        link.href = url
                                        link.setAttribute(
                                            "download",
                                            `laporan-tagihan.xlsx`
                                        )
                                        document.body.appendChild(link)
                                        link.click()
                                        link.remove() // bersih2
                                    })
                                    .catch((err) => console.error(err))
                            }}
                            disabled={!tagihanManual?.length && !tagihanOtomatis?.length}
                        >
                            <i className="fas fa-file-excel"></i>
                        </button>
                    </Role>

                    {useIsMobile() && (
                        <Role role={['bendahara', 'rt', 'rw', 'admin']}>
                            <div className="text-end ml-auto">
                                <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                                    <i className="fas fa-plus mr-2"></i>
                                    Tambah Tagihan
                                </button>
                            </div>
                        </Role>
                    )}
                    {/* </div> */}
                </>
            )}
            <Role role={'warga'}>
                <Link preserveScroll href={`/${role}/tagihan`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-undo"></i>
                </Link>
            </Role>
            {!useIsMobile() && (
                <Role role={['bendahara', 'rt', 'rw', 'admin']}>
                    <div className="text-end ml-auto mr-3">
                        <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                            <i className="fas fa-plus mr-2"></i>
                            Tambah Tagihan
                        </button>
                    </div>
                </Role>
            )}
        </form>
    )
}

export function FilterWarga({ data, setData, filter, resetFilter, role, total_warga }) {
    return (
        <form onSubmit={filter} className="filter-form form-filter d-flex px-0 pb-2 mb-2 w-100">
            <div className="col-md-5 col-12 pr-0">
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Nama..."
                    />
                    <button className="btn-filter btn btn-primary" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
                <select
                    name="jenis_kelamin"
                    value={data.jenis_kelamin}
                    onChange={(e) => setData('jenis_kelamin', e.target.value)}
                    className="form-select form-select-sm w-auto flex-fill my-2 mx-0"
                >
                    <option value="">Jenis Kelamin</option>
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                </select>
                <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0 mx-0" title="Filter Warga" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-filter"></i>
                </button>
                <Link preserveScroll href={`/${role}/warga`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-undo"></i>
                </Link>
                <Role role={['rt', 'rw', 'sekretaris', 'admin']}>
                    <button
                        className="btn btn-success my-auto mr-3"
                        type="button"
                        title={total_warga < 1 ? "Tidak ada data warga yang dapat diexport" : "Export data warga ke Excel"}
                        style={{ borderRadius: "0.2rem" }}
                        onClick={() => {
                            // window.location.href = `/${role}/export/warga`

                            axios({
                                url: `/${role}/export/warga`,
                                method: "GET",
                                responseType: "blob"
                            })
                                .then((response) => {
                                    const url = window.URL.createObjectURL(new Blob([response.data]))
                                    const link = document.createElement("a")
                                    link.href = url
                                    link.setAttribute(
                                        "download",
                                        `laporan-warga.xlsx`
                                    )
                                    document.body.appendChild(link)
                                    link.click()
                                    link.remove() // bersih2
                                })
                                .catch((err) => console.error(err))
                        }}
                        disabled={total_warga < 1}
                    >
                        <i className="fas fa-file-excel"></i>
                    </button>
                </Role>
            </div>
        </form>
    )
}

export function FilterKK({ data, setData, filter, resetFilter, role, totalKK }) {
    return (
        <form onSubmit={filter} className="filter-form form-filter px-0 pb-2 mb-2 w-100">
            <div className={useIsMobile() ? 'mx-2' : 'col-md-5 col-12'}>
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Nama Kepala Keluarga/Alamat/Nomor KK..."
                    />
                    <button className="btn-filter btn btn-primary" title="Filter Kartu Keluarga" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
                <Link
                    preserveScroll
                    href={`/${role}/kartu_keluarga`}
                    onClick={resetFilter}
                    className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0"
                    title="Reset"
                    style={{
                        maxWidth: "3rem",
                        minWidth: "3rem"
                    }}>
                    <i className="fas fa-undo"></i>
                </Link>
                <Role role={['rt', 'rw', 'sekretaris', 'admin']}>
                    <button
                        className="btn btn-success my-auto mr-3"
                        type="button"
                        title={totalKK < 1 ? "Tidak ada data kartu keluarga yang dapat diexport" : "Export data kartu keluarga ke Excel"}
                        style={{
                            borderRadius: "0.2rem",
                            maxWidth: "3rem",
                            minWidth: "3rem"
                        }}
                        onClick={() => {
                            // window.location.href = `/${role}/export/kartu_keluarga`

                            axios({
                                url: `/export/kartu_keluarga`,
                                method: "GET",
                                responseType: "blob"
                            })
                                .then((response) => {
                                    const url = window.URL.createObjectURL(new Blob([response.data]))
                                    const link = document.createElement("a")
                                    link.href = url
                                    link.setAttribute(
                                        "download",
                                        `laporan-kartu-keluarga.xlsx`
                                    )
                                    document.body.appendChild(link)
                                    link.click()
                                    link.remove() // bersih2
                                })
                                .catch((err) => console.error(err))
                        }}
                        disabled={totalKK < 1}
                    >
                        <i className="fas fa-file-excel"></i>
                    </button>
                </Role>
            </div>
        </form>
    )
}

export function FilterIuran({ iuranManual, iuranOtomatis, data, setData, filter, resetFilter, role, tambahShow }) {
    return (
        <form onSubmit={filter} className="filter-form form-filter px-0 pb-2 mb-2 w-100">
            <div className={useIsMobile() ? "mx-2" : "ml-3"} style={{ width: "30rem" }}>
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Data Iuran..."
                    />
                    <button className="btn-filter btn btn-primary" title="Filter Iuran" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <Link preserveScroll href={`/${role}/iuran`} onClick={resetFilter} className={`btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0 ${useIsMobile() ? "ml-2" : ""}`} title="Reset" style={{ maxWidth: "3rem" }}>
                <i className="fas fa-undo"></i>
            </Link>

            <Role role={['rt', 'rw', 'bendahara', 'admin']}>
                <button
                    className="btn btn-success my-auto mr-3"
                    type="button"
                    title={!iuranManual?.length && !iuranOtomatis?.length ? "Tidak ada Iuran yang dapat diexport" : "Export Iuran ke Excel"}
                    style={{ borderRadius: "0.2rem" }}
                    onClick={() => {
                        // window.location.href = `/${role}/export/iuran`

                        axios({
                            url: `/${role}/export/iuran`,
                            method: "GET",
                            responseType: "blob"
                        })
                            .then((response) => {
                                const url = window.URL.createObjectURL(new Blob([response.data]))
                                const link = document.createElement("a")
                                link.href = url
                                link.setAttribute(
                                    "download",
                                    `laporan-iuran.xlsx`
                                )
                                document.body.appendChild(link)
                                link.click()
                                link.remove() // bersih2
                            })
                            .catch((err) => console.error(err))
                    }}
                    disabled={!iuranManual?.length && !iuranOtomatis?.length}
                >
                    <i className="fas fa-file-excel"></i>
                </button>
                <Role role={['rw', 'bendahara', 'admin']}>
                    <div className={`text-end ml-auto ${useIsMobile() ? "mr-2" : "mr-3"}`}>
                        <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                            <i className="fas fa-plus mr-2"></i>
                            Tambah Iuran
                        </button>
                    </div>
                </Role>
            </Role>
        </form >
    )
}

export function FilterLaporanKeuangan({ transaksi, exportExcel, exportPdf, handleChangeBulan, data, setData, daftar_tahun, daftar_bulan, tahunIni, bulanIni, filter, resetFilter, role }) {
    const [showMenu, setShowMenu] = useState(false)
    const toggleMenu = () => setShowMenu(prev => !prev)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false)
            }
        }

        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [])

    return (
        <form onSubmit={filter} className="filter-form form-filter d-flex px-0 g-2 pb-2 mb-2 w-100">
            <div className="col-md-5 col-12 pr-2">
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Transaksi..."
                    />
                    <button className="btn-filter btn btn-primary my-0" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
                <select
                    name="tahun"
                    value={data.tahun}
                    onChange={(e) => setData('tahun', e.target.value)}
                    className="form-select form-select-sm flex-fill my-2"
                >
                    <option value="">Tahun ini</option>
                    {daftar_tahun.map((th) => {
                        if (th === tahunIni) return null
                        return (
                            <option key={th} value={th}>
                                {th}
                            </option>
                        )
                    })}
                </select>

                <select
                    name="bulan"
                    value={data.bulan}
                    onChange={(e) => handleChangeBulan(e)}
                    className="form-select form-select-sm flex-fill my-2"
                >
                    <option value="">Bulan ini</option>
                    {daftar_bulan.map((nama, index) => (
                        <option key={index + 1} value={index + 1}>
                            {nama.charAt(0).toUpperCase() + nama.slice(1)}
                        </option>
                    ))}
                </select>

                <select
                    name="jenis"
                    value={data.jenis}
                    onChange={(e) => setData('jenis', e.target.value)}
                    className="form-select form-select-sm flex-fill my-2"
                >
                    <option value="">Semua jenis</option>
                    <option value="pemasukan">Pemasukan</option>
                    <option value="pengeluaran">Pengeluaran</option>
                </select>
                <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0" title="Filter Laporan" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-filter"></i>
                </button>
                <Link preserveScroll href={'/laporan-keuangan'} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-undo"></i>
                </Link>
                <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <button
                        className="btn-input btn btn-sm btn-primary flex-fill p-0"
                        style={{ maxWidth: "3rem", minWidth: "3rem", fontSize: "1rem" }}
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleMenu()
                        }}
                        disabled={!transaksi?.length}
                        title="Export Laporan"
                    >
                        <i className="fas fa-file-download"></i>
                    </button>
                    {showMenu && (
                        <div>
                            <div
                                ref={menuRef}
                                style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "110%",
                                    background: "white",
                                    border: "1px solid lightgray",
                                    borderRadius: "8px",
                                    padding: "8px 0",
                                    width: "140px",
                                    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                                    zIndex: 50
                                }}
                            >
                                <button
                                    className="dropdown-item"
                                    style={{ padding: "6px 12px", cursor: "pointer", color: 'green' }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        exportExcel(e)
                                    }}
                                >
                                    <i className="fas fa-file-excel me-2"></i>
                                    Export Excel
                                </button>
                                <button
                                    className="dropdown-item"
                                    style={{ padding: "6px 12px", cursor: "pointer", color: 'red' }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        exportPdf(e)
                                    }}
                                >
                                    <i className="fas fa-file-pdf me-2"></i>
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    )
}

export function FilterLaporanPengaduan({ pengaduan, exportExcel, exportPdf, data, setData, daftar_tahun, daftar_bulan, filter, resetFilter, role }) {
    const [showMenu, setShowMenu] = useState(false)
    const toggleMenu = () => setShowMenu(prev => !prev)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false)
            }
        }

        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [])

    return (
        <form onSubmit={filter} className="filter-form form-filter d-flex px-0 g-2 pb-2 mb-2 w-100">
            <div className="col-md-5 col-12 pr-2">
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Pengaduan..."
                    />
                    <button className="btn-filter btn btn-primary my-0" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
                <select
                    name="tahun"
                    value={data.tahun}
                    onChange={(e) => setData('tahun', e.target.value)}
                    className="form-select form-select-sm flex-fill my-2"
                >
                    <option value="">Semua Tahun</option>
                    {daftar_tahun.map((th) => (
                        <option key={th} value={th}>
                            {th}
                        </option>
                    ))}
                </select>

                <select
                    name="bulan"
                    value={data.bulan}
                    onChange={(e) => setData('bulan', e.target.value)}
                    className="form-select form-select-sm flex-fill my-2"
                >
                    <option value="">Semua Bulan</option>
                    {daftar_bulan.map((nama, index) => (
                        <option key={index + 1} value={index + 1}>
                            {nama.charAt(0).toUpperCase() + nama.slice(1)}
                        </option>
                    ))}
                </select>

                <select
                    name="kategori"
                    value={data.kategori}
                    onChange={(e) => setData('kategori', e.target.value)}
                    className="form-select form-select-sm flex-fill my-2"
                >
                    <option value="">Semua Pengaduan</option>
                    <option value="rt">Pengaduan RT</option>
                    <option value="rw">Pengaduan RW</option>
                </select>

                <select
                    name="status"
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="form-select form-select-sm flex-fill my-2"
                >
                    <option value="">Semua Status</option>
                    <option value="belum">Belum</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                </select>

                <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0" title="Filter Pengumuman" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-filter"></i>
                </button>

                <Link preserveScroll href={'/laporan-pengaduan'} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-undo"></i>
                </Link>

                <div style={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <button
                        className="btn-input btn btn-sm btn-primary flex-fill p-0"
                        style={{ maxWidth: "3rem", minWidth: "3rem", fontSize: "1rem" }}
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleMenu()
                        }}
                        disabled={!pengaduan?.length}
                        title="Export Laporan"
                    >
                        <i className="fas fa-file-download"></i>
                    </button>
                    {showMenu && (
                        <div>
                            <div
                                ref={menuRef}
                                style={{
                                    position: "absolute",
                                    right: 0,
                                    top: "110%",
                                    background: "white",
                                    border: "1px solid lightgray",
                                    borderRadius: "8px",
                                    padding: "8px 0",
                                    width: "140px",
                                    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                                    zIndex: 50
                                }}
                            >
                                <button
                                    className="dropdown-item"
                                    style={{ padding: "6px 12px", cursor: "pointer", color: 'green' }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        exportExcel(e)
                                    }}
                                >
                                    <i className="fas fa-file-excel me-2"></i>
                                    Export Excel
                                </button>
                                <button
                                    className="dropdown-item"
                                    style={{ padding: "6px 12px", cursor: "pointer", color: 'red' }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        exportPdf(e)
                                    }}
                                >
                                    <i className="fas fa-file-pdf me-2"></i>
                                    Export PDF
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    )
}