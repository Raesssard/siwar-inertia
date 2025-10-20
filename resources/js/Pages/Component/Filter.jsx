import React from "react"
import { Link } from "@inertiajs/react"
import Role from "./Role"
import axios from "axios"

export function FilterPengaduan({ data, setData, list_tahun, list_bulan, list_level, filter, resetFilter, tambahShow, role }) {
    return (
        <form onSubmit={filter} className="form-filter row g-2 pl-3 pb-2 mb-2 w-100">
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

                <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill" title="Filter">
                    <i className="fas fa-filter"></i>
                </button>
                <Link
                    href={`/${role}/pengaduan`}
                    preserveScroll
                    className="btn-input btn btn-secondary btn-sm flex-fill my-auto"
                    title="Reset"
                    onClick={resetFilter}
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

export function FilterPengumuman({ data, setData, daftar_tahun, list_bulan, daftar_kategori, filter, resetFilter, tambahShow, role }) {
    return (
        <form onSubmit={filter} className="form-filter row g-2 pl-3 pb-2 mb-2 w-100">
            <div className="col-md-5 col-12 pr-1 mb-auto">
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
                >
                    <option value="">Semua Pengumuman</option>
                    <option value="rt">Pengumuman RT</option>
                    <option value="rw">Pengumuman RW</option>
                </select>

                <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0" title="Filter Pengumuman">
                    <i className="fas fa-filter"></i>
                </button>
                <Link href={`/${role}/pengumuman`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0" title="Reset">
                    <i className="fas fa-undo"></i>
                </Link>
                <Role role={['rt', 'rw']}>
                    <div className="w-100 text-end">
                        <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                            <i className="fas fa-plus mr-2"></i>
                            Buat Pengumuman
                        </button>
                    </div>
                </Role>
            </div>
        </form>
    )
}

export function FilterTransaksi({ transaksi, data, setData, daftar_tahun, daftar_bulan, filter, resetFilter, tambahShow, role }) {
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


            <div className="d-flex flex-wrap gap-2" style={{ width: "55%" }}>
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
                <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0" title="Filter Pengumuman" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-filter"></i>
                </button>
                <Link href={`/${role}/transaksi`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-undo"></i>
                </Link>
                <Role role={['rt', 'rw']}>
                    <button
                        className="btn btn-success my-auto mr-3"
                        type="button"
                        title={!transaksi.length ? "Tidak ada Transaksi yang dapat diexport" : "Export Transaksi ke Excel"}
                        style={{ borderRadius: "0.2rem" }}
                        onClick={() => window.location.href = `/${role}/export/transaksi`}
                        disabled={!transaksi.length}
                    >
                        <i className="fas fa-file-excel"></i>
                    </button>
                    <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                        <i className="fas fa-plus mr-2"></i>
                        Buat Transaksi
                    </button>
                </Role>
            </div>
        </form>
    )
}

export function FilterTagihan({ tagihanManual, tagihanOtomatis, data, setData, filter, resetFilter, role, kk_list }) {
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
                        placeholder="Cari Nama..."
                    />
                    <button className="btn-filter btn btn-primary" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <div className="d-flex flex-wrap gap-2" style={role === 'warga' ? { maxWidth: "3rem", minWidth: "3rem" } : null}>
                <Role role={['rt', 'rw']}>
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
                    <button type="submit" className="btn-input btn btn-sm btn-primary flex-fill p-0 mx-0" title="Filter Warga" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                        <i className="fas fa-filter"></i>
                    </button>
                </Role>
                <Link href={`/${role}/tagihan`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-undo"></i>
                </Link>
            </div>

            <Role role={['rt', 'rw']}>
                <button
                    className="btn btn-success my-auto mr-3 ml-auto"
                    type="button"
                    title={!tagihanManual.length && !tagihanOtomatis.length ? "Tidak ada Tagihan yang dapat diexport" : "Export Tagihan ke Excel"}
                    style={{ borderRadius: "0.2rem" }}
                    onClick={() => window.location.href = `/${role}/export/tagihan`}
                    disabled={!tagihanManual.length && !tagihanOtomatis.length}
                >
                    <i className="fas fa-file-excel mr-2"></i>
                    Export Tagihan
                </button>
            </Role>
        </form>
    )
}

export function FilterWarga({ data, setData, filter, resetFilter, role }) {
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
                <Link href={`/${role}/warga`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem", minWidth: "3rem" }}>
                    <i className="fas fa-undo"></i>
                </Link>
            </div>
        </form>
    )
}

export function FilterKK({ data, setData, filter, resetFilter, role }) {
    return (
        <form onSubmit={filter} className="filter-form form-filter px-0 pb-2 mb-2 w-100">
            <div className="col-md-5 col-12 pr-0">
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Nama Kepala Keluarga/Alamat/Nomor KK..."
                    />
                    <button className="btn-filter btn btn-primary" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <Link href={`/${role}/kartu_keluarga`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0 mr-3" title="Reset" style={{ maxWidth: "3rem" }}>
                <i className="fas fa-undo"></i>
            </Link>
        </form>
    )
}

export function FilterIuran({ iuranManual, iuranOtomatis, data, setData, filter, resetFilter, role, tambahShow }) {
    return (
        <form onSubmit={filter} className="filter-form form-filter px-0 pb-2 mb-2 w-100">
            <div className="ml-3" style={{ width: "30rem" }}>
                <div className="input-group input-group-sm">
                    <input
                        type="text"
                        name="search"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        className="form-control"
                        placeholder="Cari Data Iuran..."
                    />
                    <button className="btn-filter btn btn-primary" type="submit">
                        <i className="fas fa-search"></i>
                    </button>
                </div>
            </div>

            <Link href={`/${role}/iuran`} onClick={resetFilter} className="btn-input btn btn-secondary btn-sm flex-fill p-0 mx-0" title="Reset" style={{ maxWidth: "3rem" }}>
                <i className="fas fa-undo"></i>
            </Link>

            <Role role={['rt', 'rw']}>
                <button
                    className="btn btn-success my-auto mr-3"
                    type="button"
                    title={!iuranManual.length && !iuranOtomatis.length ? "Tidak ada Iuran yang dapat diexport" : "Export Iuran ke Excel"}
                    style={{ borderRadius: "0.2rem" }}
                    onClick={() => window.location.href = `/${role}/export/iuran`}
                    disabled={!iuranManual.length && !iuranOtomatis.length}
                >
                    <i className="fas fa-file-excel"></i>
                </button>
                <div className="text-end ml-auto mr-3">
                    <button type="button" onClick={() => tambahShow()} className="btn-input btn btn-sm btn-success">
                        <i className="fas fa-plus mr-2"></i>
                        Tambah Iuran
                    </button>
                </div>
            </Role>
        </form >
    )
}