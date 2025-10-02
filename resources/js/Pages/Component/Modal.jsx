import React, { useEffect, useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import logo from '../../../../public/img/logo.png'

// Modal sidebar buat mobile mah nanti aja
export function ModalSidebar({ modalIsOpen, modalShow }) {
    const { url } = usePage()

    const isActive = (url, pattern) => {
        return url.startsWith(pattern)
    }

    return (
        <>
            {modalIsOpen && (
                <div
                    className="modal fade show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    onClick={() => modalShow(false)}
                >
                    <div
                        className={`modal-dialog modal-dialog-slideout-left modal-sm animasi-modal ${modalIsOpen ? "show" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content bg-primary text-white">
                            <div className="modal-header border-0">
                                <img src={logo} alt="Logo" className="sidebar-brand-icon-logo" />
                                <button className="close text-white" onClick={() => modalShow(false)}>
                                    ×
                                </button>
                            </div>
                            <div className="modal-body p-0">
                                <ul className="navbar-nav sidebar sidebar-dark accordion">
                                    <hr className="sidebar-divider my-0" />
                                    <li className={`nav-item ${isActive(url, '/warga') ? 'active' : ''}`}>
                                        <Link className="nav-link" href="/warga">
                                            <i className="fas fa-fw fa-tachometer-alt mr-2"></i>
                                            <span>Dashboard</span>
                                        </Link>
                                    </li>


                                    <li className={`nav-item ${isActive(url, '/warga/pengumuman') ? 'active' : ''}`}>
                                        <Link className="nav-link" href="/warga/pengumuman">
                                            <i className="fas fa-bullhorn mr-2"></i>
                                            <span>Pengumuman</span>
                                        </Link>
                                    </li>

                                    <li className={`nav-item ${isActive(url, '/warga/pengaduan') ? 'active' : ''}`}>
                                        <Link className="nav-link" href="/warga/pengaduan">
                                            <i className="fas fa-paper-plane mr-2"></i>
                                            <span>Pengaduan</span>
                                        </Link>
                                    </li>

                                    <li className={`nav-item ${isActive(url, '/warga/kk') ? 'active' : ''}`}>
                                        <Link className="nav-link" href="/warga/kk">
                                            <i className="fas fa-id-card mr-2"></i>
                                            <span>Lihat KK</span>
                                        </Link>
                                    </li>
                                    <li className={`nav-item ${isActive(url, '/warga/tagihan') ? 'active' : ''}`}>
                                        <Link className="nav-link" href="/warga/tagihan">
                                            <i className="fas fa-hand-holding-usd mr-2"></i>
                                            <span>Lihat Tagihan</span>
                                        </Link>
                                    </li>
                                    <li className={`nav-item ${isActive(url, '/warga/transaksi') ? 'active' : ''}`}>
                                        <Link className="nav-link" href="/warga/transaksi">
                                            <i className="fas fa-money-bill-wave mr-2"></i>
                                            <span>Lihat Transaksi</span>
                                        </Link>
                                    </li>
                                    <hr className="sidebar-divider d-none d-md-block" />
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export function PasswordModal({ show }) {
    return (
        <>
            <div
                className="modal fade show"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={() => show(false)}>
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-key text-primary me-1"></i>{" "}
                                    Ubah Password
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => show(false)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="form-floating mb-3 position-relative">
                                    <input
                                        type="password"
                                        name="current_password"
                                        className="form-control"
                                        id="current_password"
                                        placeholder="Password Lama"
                                        required
                                    />
                                    <label htmlFor="current_password">
                                        <i className="fas fa-lock me-2"></i>
                                        Password Lama
                                    </label>
                                </div>
                                <div className="form-floating mb-3 position-relative">
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        id="password"
                                        placeholder="Password Baru"
                                        required
                                        minLength="6"
                                    />
                                    <label htmlFor="password">
                                        <i className="fas fa-lock me-2"></i>
                                        Password Baru
                                    </label>
                                </div>
                                <div className="form-floating mb-3 position-relative">
                                    <input
                                        type="password"
                                        name="password_confirmation"
                                        className="form-control"
                                        id="password_confirmation"
                                        placeholder="Konfirmasi Password Baru"
                                        required
                                    />
                                    <label htmlFor="password_confirmation">
                                        <i className="fas fa-lock me-2"></i>
                                        Konfirmasi Password
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => show(false)}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export function DetailPengumuman({ selectedData, detailShow, onClose }) {
    if (!detailShow || !selectedData) return null
    return (
        <>
            <div className="modal fade show" tabIndex="-1" style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)"
            }}>
                <div className="modal-dialog modal-lg modal-dialog-scrollable">
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title mb-0">Detail Pengumuman</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={onClose}
                            />
                        </div>
                        <div className="modal-body px-4 pt-4 pb-3">
                            <h4 className="fw-bold text-success mb-2">{selectedData.judul}</h4>
                            <div className="d-flex align-items-center mb-3">
                                <span className="text-muted me-3">
                                    <i className="bi bi-calendar me-1"></i>{new Date(selectedData.tanggal).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                    })}
                                </span>
                                {selectedData.id_rt ?
                                    <span className="text-dark fw-semibold">
                                        <i className="me-1"></i>{`Dari RT: ${selectedData.rukun_tetangga?.rt ?? '-'}`}
                                    </span>
                                    :
                                    <span className="text-dark fw-semibold">
                                        <i className="me-1"></i>{`Dari RW: ${selectedData.rw?.nomor_rw ?? '-'}`}
                                    </span>
                                }
                            </div>
                            <ul className="list-unstyled mb-3 small">
                                <li><strong>Kategori:</strong> <span className="ms-1">{selectedData.kategori ?? '-'}</span></li>
                            </ul>
                            <hr className="my-3" />
                            <div className="mb-4">
                                <h5 className="fw-bold text-success mb-2">Isi Pengumuman:</h5>
                                <div className="border rounded bg-light p-3" style={{ lineHeight: "1.6" }}>
                                    {selectedData.isi}
                                </div>
                            </div>
                            <div className="mb-3">
                                <h5 className="fw-bold text-success mb-2">Dokumen Terlampir:</h5>
                                {selectedData.dokumen_path ? (
                                    <div className="border rounded bg-light p-3 d-flex align-items-center justify-content-between">
                                        <div>
                                            <i className="bi bi-file-earmark-text me-2"></i>
                                            <span>{selectedData.dokumen_name ?? 'Dokumen Terlampir'}</span>
                                            <small className="text-muted d-block mt-1">Klik tombol di samping untuk melihat atau mengunduh.</small>
                                        </div>
                                        <a href={selectedData.dokumen_url} target="_blank" className="btn btn-primary btn-sm">
                                            <i className="bi bi-download"></i> Unduh
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-muted p-3 border rounded bg-light">
                                        Tidak ada dokumen yang terlampir.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer bg-light border-0 justify-content-end py-2">
                            <button
                                className="btn btn-outline-success"
                                onClick={onClose}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// --- Modal Tambah RW ---
export function AddRwModal({ form, handleChange, handleAdd, onClose }) {
    return (
        <div className="modal fade show"
             style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <form onSubmit={handleAdd}>
                        <div className="modal-header">
                            <h5>Tambah RW</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>NIK</label>
                                <input type="text" name="nik" value={form.nik} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Nomor RW</label>
                                <input type="text" name="nomor_rw" value={form.nomor_rw} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Nama Ketua RW</label>
                                <input type="text" name="nama_ketua_rw" value={form.nama_ketua_rw} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Mulai Menjabat</label>
                                <input type="date" name="mulai_menjabat" value={form.mulai_menjabat} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Akhir Jabatan</label>
                                <input type="date" name="akhir_jabatan" value={form.akhir_jabatan} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-custom btn-secondary" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn-custom btn-primary">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// --- Modal Edit RW ---
export function EditRwModal({ form, handleChange, handleEdit, onClose }) {
    return (
        <div className="modal fade show"
             style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <form onSubmit={handleEdit}>
                        <div className="modal-header">
                            <h5>Edit RW</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>NIK</label>
                                <input type="text" name="nik" value={form.nik} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Nomor RW</label>
                                <input type="text" name="nomor_rw" value={form.nomor_rw} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Nama Ketua RW</label>
                                <input type="text" name="nama_ketua_rw" value={form.nama_ketua_rw} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Mulai Menjabat</label>
                                <input type="date" name="mulai_menjabat" value={form.mulai_menjabat} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Akhir Jabatan</label>
                                <input type="date" name="akhir_jabatan" value={form.akhir_jabatan} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn-custom btn-secondary" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn-custom btn-primary">Update</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
