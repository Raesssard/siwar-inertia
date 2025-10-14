import React, { useEffect, useRef, useState } from "react"
import { Link, useForm, usePage } from "@inertiajs/react"
import logo from '../../../../public/img/logo.png'
import axios from "axios"
import { FormatWaktu } from "../Warga/Pengaduan"
import { SidebarLink } from "./SidebarLink"
import { formatTanggal, getAdminLinks, getRtLinks, getWargaLinks, getRwLinks } from "./GetPropRole"
import Role from "./Role"

export function ModalSidebar({ modalIsOpen, modalShow }) {
    const { url } = usePage()
    const { props } = usePage()
    const role = props.auth?.currentRole

    const isActive = (url, pattern) => {
        return url.startsWith(pattern)
    }

    let statLinks = []

    switch (role) {
        case "admin":
            statLinks = getAdminLinks()
            break
        case "rw":
            statLinks = getRwLinks()
            break
        case "rt":
            statLinks = getRtLinks()
            break
        case "warga":
            statLinks = getWargaLinks()
            break
        default:
            statLinks = []
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
                            <div className="modal-body p-0 m-0 d-block" style={{ overflowY: "hidden" }}>
                                <ul className="navbar-nav sidebar sidebar-dark accordion">
                                    <hr className="sidebar-divider my-0" />
                                    {statLinks.map((link, index) => (
                                        <SidebarLink key={index} {...link} />
                                    ))}
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

export function AddRwModal({ form, handleChange, handleAdd, onClose }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 fade-in">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md animate-scaleIn">
                <form onSubmit={handleAdd} className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h5 className="text-lg font-semibold">Tambah RW</h5>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium">NIK</label>
                            <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nomor RW</label>
                            <input type="text" name="nomor_rw" value={form.nomor_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Ketua RW</label>
                            <input type="text" name="nama_ketua_rw" value={form.nama_ketua_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>

                        {/* 🔹 Tambahan Jabatan */}
                        <div>
                            <label className="block text-sm font-medium">Jabatan</label>
                            <select name="jabatan" value={form.jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2">
                                <option value="">Pilih Jabatan</option>
                                <option value="ketua">Ketua RW</option>
                                <option value="sekretaris">Sekretaris RW</option>
                                <option value="bendahara">Bendahara RW</option>
                            </select>
                        </div>

                        {/* 🔹 Tambahan Status */}
                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select name="status" value={form.status || ""} onChange={handleChange} className="w-full border rounded-md p-2">
                                <option value="">Pilih Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function EditRwModal({ form, handleChange, handleEdit, onClose }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 fade-in">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md animate-scaleIn">
                <form onSubmit={handleEdit} className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h5 className="text-lg font-semibold">Edit RW</h5>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium">NIK</label>
                            <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nomor RW</label>
                            <input type="text" name="nomor_rw" value={form.nomor_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Ketua RW</label>
                            <input type="text" name="nama_ketua_rw" value={form.nama_ketua_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2"  />
                        </div>

                        {/* 🔹 Tambahan Jabatan */}
                        <div>
                            <label className="block text-sm font-medium">Jabatan</label>
                            <select name="jabatan" value={form.jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2">
                                <option value="">Pilih Jabatan</option>
                                <option value="ketua">Ketua RW</option>
                                <option value="sekretaris">Sekretaris RW</option>
                                <option value="bendahara">Bendahara RW</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function AddRtModal({ form, handleChange, handleAdd, onClose, rwList = [], isRw = false }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 fade-in">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md animate-scaleIn">
                <form onSubmit={handleAdd} className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h5 className="text-lg font-semibold">Tambah RT</h5>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="space-y-3">
                        {/* 🔹 NIK */}
                        <div>
                            <label className="block text-sm font-medium">NIK</label>
                            <input
                                type="text"
                                name="nik"
                                value={form.nik || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                        {/* 🔹 Nomor RT */}
                        <div>
                            <label className="block text-sm font-medium">Nomor RT</label>
                            <input
                                type="text"
                                name="nomor_rt"
                                value={form.nomor_rt || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                        {/* 🔹 Nama Ketua RT */}
                        <div>
                            <label className="block text-sm font-medium">Nama Ketua RT</label>
                            <input
                                type="text"
                                name="nama_ketua_rt"
                                value={form.nama_ketua_rt || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                        {/* 🔹 Jabatan */}
                        <div>
                            <label className="block text-sm font-medium">Jabatan</label>
                            <select
                                name="jabatan"
                                value={form.jabatan || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="">-- Pilih Jabatan --</option>
                                <option value="ketua">Ketua RT</option>
                                <option value="sekretaris">Sekretaris</option>
                                <option value="bendahara">Bendahara</option>
                            </select>
                        </div>

                        {/* 🔹 Tanggal Menjabat */}
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input
                                type="date"
                                name="mulai_menjabat"
                                value={form.mulai_menjabat || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input
                                type="date"
                                name="akhir_jabatan"
                                value={form.akhir_jabatan || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            />
                        </div>

                        {/* 🔹 Pilih RW (hanya untuk admin) */}
                        {!isRw && (
                            <div>
                                <label className="block text-sm font-medium">Pilih RW</label>
                                <select
                                    name="id_rw"
                                    value={form.id_rw || ""}
                                    onChange={handleChange}
                                    className="w-full border rounded-md p-2"
                                >
                                    <option value="">-- Pilih RW --</option>
                                    {rwList.map((rw) => (
                                        <option key={rw.id} value={rw.id}>
                                            RW {rw.nomor_rw} - {rw.nama_ketua_rw}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* 🔹 Status (tetap muncul untuk semua) */}
                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select
                                name="status"
                                value={form.status || "aktif"}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    {/* 🔹 Tombol Aksi */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditRtModal({ form, handleChange, handleEdit, onClose, rwList = [], isRw = false }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 fade-in">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md animate-scaleIn">
                <form onSubmit={handleEdit} className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h5 className="text-lg font-semibold">Edit RT</h5>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium">NIK</label>
                            <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Nomor RT</label>
                            <input type="text" name="nomor_rt" value={form.nomor_rt || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Nama Ketua RT</label>
                            <input type="text" name="nama_ketua_rt" value={form.nama_ketua_rt || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>

                        {/* 🔹 Jabatan */}
                        <div>
                            <label className="block text-sm font-medium">Jabatan</label>
                            <select name="jabatan" value={form.jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2">
                                <option value="">-- Pilih Jabatan --</option>
                                <option value="ketua">Ketua RT</option>
                                <option value="sekretaris">Sekretaris</option>
                                <option value="bendahara">Bendahara</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>

                        {/* 🔹 Pilih RW (hanya untuk admin) */}
                        {!isRw && (
                            <div>
                                <label className="block text-sm font-medium">Pilih RW</label>
                                <select name="id_rw" value={form.id_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2">
                                    <option value="">-- Pilih RW --</option>
                                    {rwList.map((rw) => (
                                        <option key={rw.id} value={rw.id}>
                                            RW {rw.nomor_rw} - {rw.nama_ketua_rw}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* 🔹 Tombol Aksi */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AddKategoriGolonganModal({ form, handleChange, handleAdd, onClose }) {
    return (
        <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <form onSubmit={handleAdd}>
                        <div className="modal-header">
                            <h5>Tambah Kategori Golongan</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Jenis</label>
                                <input
                                    type="text"
                                    name="jenis"
                                    value={form.jenis}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Masukkan nama kategori"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-custom btn-secondary"
                                onClick={onClose}
                            >
                                Batal
                            </button>
                            <button type="submit" className="btn-custom btn-primary">
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export function EditKategoriGolonganModal({ form, handleChange, handleEdit, onClose }) {
    return (
        <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <form onSubmit={handleEdit}>
                        <div className="modal-header">
                            <h5>Edit Kategori Golongan</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Jenis</label>
                                <input
                                    type="text"
                                    name="jenis"
                                    value={form.jenis}
                                    onChange={handleChange}
                                    className="form-control"
                                    placeholder="Masukkan nama kategori"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-custom btn-secondary"
                                onClick={onClose}
                            >
                                Batal
                            </button>
                            <button type="submit" className="btn-custom btn-primary">
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export function AddRoleModal({ form, setForm, handleAdd, onClose }) {
    return (
        <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <form onSubmit={handleAdd}>
                        <div className="modal-header">
                            <h5>Tambah Role</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nama Role</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    className="form-control"
                                    placeholder="Masukkan nama role"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Batal
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Simpan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export function EditRoleModal({ form, setForm, handleEdit, onClose }) {
    return (
        <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <form onSubmit={handleEdit}>
                        <div className="modal-header">
                            <h5>Edit Role</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nama Role</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    className="form-control"
                                    placeholder="Masukkan nama role"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
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
    )
}

export function EditRolePermissionModal({
    role,
    permissions,
    selectedPerms,
    togglePermission,
    handleSave,
    onClose,
}) {
    return (
        <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content shadow-lg border-0 rounded-3">
                    {/* Header */}
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            Atur Permissions untuk Role:{" "}
                            <strong className="text-warning">{role.name}</strong>
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onClose}
                        />
                    </div>

                    {/* Body */}
                    <div
                        className="modal-body"
                        style={{
                            maxHeight: "70vh",
                            overflowY: "auto",
                            backgroundColor: "#f9fafb",
                            padding: "20px 25px",
                        }}
                    >
                        {permissions.length ? (
                            <div className="row g-3">
                                {permissions.map((perm) => (
                                    <div key={perm.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <label
                                            className="d-flex align-items-center p-2 rounded border bg-white shadow-sm hover-shadow-sm"
                                            style={{
                                                transition: "all 0.2s ease",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPerms.includes(perm.name)}
                                                onChange={() => togglePermission(perm.name)}
                                                className="form-check-input me-2"
                                            />
                                            <span
                                                className="text-dark"
                                                style={{
                                                    fontSize: "0.9rem",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {perm.name}
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted py-4">
                                Tidak ada permission tersedia.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-top bg-light">
                        <button
                            type="button"
                            className="btn btn-secondary px-4"
                            onClick={onClose}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary px-4"
                            onClick={handleSave}
                        >
                            Simpan Permissions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


export function AddPermissionModal({ form, setForm, handleAdd, onClose }) {
    return (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <form onSubmit={handleAdd}>
                        <div className="modal-header">
                            <h5>Tambah Permission</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nama Permission</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm("name", e.target.value)}
                                    className="form-control"
                                    placeholder="Masukkan nama permission"
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export function EditPermissionModal({ form, setForm, handleEdit, onClose }) {
    return (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <form onSubmit={handleEdit}>
                        <div className="modal-header">
                            <h5>Edit Permission</h5>
                            <button type="button" className="btn-close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Nama Permission</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm("name", e.target.value)}
                                    className="form-control"
                                    placeholder="Masukkan nama permission baru"
                                    required
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                            <button type="submit" className="btn btn-primary">Update</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export function DetailPengaduan({ selectedData, detailShow, onClose, onUpdated, onDeleted, userData, role }) {
    const { data, setData, reset } = useForm({
        isi_komentar: "",
        file: null,
    })
    const [komentar, setKomentar] = useState([])
    const [captionExpanded, setCaptionExpanded] = useState(false)
    const [commentExpanded, setCommentExpanded] = useState({})
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [isConfirm, setIsConfirm] = useState(false)
    const [previewBukti, setPreviewBukti] = useState(null)
    const textRef = useRef(null)
    const komenRef = useRef(null)
    const videoRef = useRef(null)
    const komenVideoRef = useRef(null)
    const previewVideoRef = useRef(null)
    const fileInputRef = useRef(null)

    const handleClear = () => {
        setData("file", null)
        setPreviewBukti(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        videoRef.current.play()
    }

    useEffect(() => {
        setIsConfirm(selectedData?.konfirmasi_rw === 'menunggu' || selectedData?.konfirmasi_rw === 'sudah')
    }, [selectedData])

    const toggleEdit = () => {
        setIsEdit(!isEdit)
    }

    const toggleExpand = (id) => {
        setCommentExpanded((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    useEffect(() => {
        if (textRef.current) {
            const el = textRef.current
            setIsOverflowing(el.scrollHeight > el.clientHeight)
        }
    }, [selectedData])

    useEffect(() => {
        setKomentar(
            (selectedData?.komentar || []).sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )
        )
    }, [selectedData])

    useEffect(() => {
        if (isEdit) return

        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose()
                setIsConfirm(selectedData?.konfirmasi_rw === 'menunggu' || selectedData?.konfirmasi_rw === 'sudah')
            }
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [isEdit, onClose])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (!selectedFile) {
            setPreviewBukti(null)
            setData("file", null)
            return
        }

        setData("file", selectedFile || null)

        const fileName = selectedFile.name.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewBukti({ type: "image", src: ev.target.result })
            reader.readAsDataURL(selectedFile)
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi")) {
            setPreviewBukti({ type: "video", src: URL.createObjectURL(selectedFile) })
        } else if (fileName.endsWith(".pdf")) {
            setPreviewBukti({ type: "pdf", src: URL.createObjectURL(selectedFile) })
        } else {
            setPreviewBukti({ type: "other", name: selectedFile.name })
        }
    }

    const handleSubmit = () => {
        if (!data.isi_komentar.trim() && !data.file) return

        const formData = new FormData()
        formData.append("isi_komentar", data.isi_komentar)
        if (data.file) formData.append("file", data.file)

        axios.post(`/${role}/pengaduan/${selectedData.id}/komentar`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then(res => {
                setKomentar(prev => [res.data, ...prev])
                reset()
                handleClear()
                if (komenRef.current) {
                    komenRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    })
                }
            })
            .catch(err => {

                console.error(err)
            })
    }

    const handleConfirm = () => {
        axios.put(`/${role}/pengaduan/${selectedData.id}/konfirmasi`, {
            konfirmasi_rw: 'menunggu',
            isi_komentar: "Sudah diteruskan ke RW untuk ditindaklanjuti"
        })
            .then(res => {
                console.log(res.data.pengaduan)
                console.log(res.data.komentar)
                setIsConfirm(true)
                setKomentar(prev => [res.data, ...prev])
            })
            .catch(err => console.error(err))
    }

    useEffect(() => {
        const handleEnter = (e) => {
            if (e.key === "Enter") handleSubmit()
        }
        document.addEventListener("keydown", handleEnter)
        return () => document.removeEventListener("keydown", handleEnter)
    }, [data.isi_komentar, selectedData])

    const fileName = selectedData?.file_name?.toLowerCase() || ""

    const handleCheckboxChange = (checked) => {
        const newStatus = checked ? 'selesai' : 'diproses'

        axios.put(`/${role}/pengaduan/${selectedData.id}/status`, { status: newStatus })
            .then(res => {
                console.log("Status diperbarui:", res.data)
                if (onUpdated) {
                    onUpdated({ ...selectedData, status: newStatus })
                }
            })
            .catch(err => {
                console.error("Gagal ubah status:", err.response?.data || err)
            })
    }

    useEffect(() => {
        if (videoRef.current) {
            if ((previewBukti && previewBukti.type === "video") && videoRef.current) {
                videoRef.current.pause()
            }
        }

        if (komenVideoRef.current) {
            if ((previewBukti && previewBukti.type === "video") && komenVideoRef.current) {
                komenVideoRef.current.pause()
            }
        }
    }, [previewBukti, videoRef, komenVideoRef])

    useEffect(() => {
        const komenVideo = komenVideoRef.current
        const selectedVideo = videoRef.current
        const previewVideo = previewVideoRef.current

        const pauseOthers = (source) => {
            if (source !== komenVideo && komenVideo && !komenVideo.paused) komenVideo.pause()
            if (source !== selectedVideo && selectedVideo && !selectedVideo.paused) selectedVideo.pause()
            if (source !== previewVideo && previewVideo && !previewVideo.paused) previewVideo.pause()
        }

        const handleKomenPlay = () => pauseOthers(komenVideo)
        const handleSelectedPlay = () => pauseOthers(selectedVideo)
        const handlePreviewPlay = () => pauseOthers(previewVideo)

        if (komenVideo) komenVideo.addEventListener("play", handleKomenPlay)
        if (selectedVideo) selectedVideo.addEventListener("play", handleSelectedPlay)
        if (previewVideo) previewVideo.addEventListener("play", handlePreviewPlay)

        return () => {
            if (komenVideo) komenVideo.removeEventListener("play", handleKomenPlay)
            if (selectedVideo) selectedVideo.removeEventListener("play", handleSelectedPlay)
            if (previewVideo) previewVideo.removeEventListener("play", handlePreviewPlay)
        }
    }, [previewBukti,
        komenVideoRef.current,
        videoRef.current,
        previewVideoRef.current])

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    if (!detailShow || !selectedData) return null

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)",
                }}
                onClick={() => {
                    onClose()
                    setIsEdit(false)
                    setIsConfirm(selectedData?.konfirmasi_rw === 'menunggu' || selectedData?.konfirmasi_rw === 'sudah')
                }}
            >
                <div
                    className="modal-dialog modal-komen modal-lg modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content modal-komen shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            {isEdit ? (
                                <EditPengaduan
                                    toggle={toggleEdit}
                                    pengaduan={selectedData}
                                    onUpdated={(updatedPengaduan) => {
                                        onUpdated(updatedPengaduan)
                                        setIsEdit(false)
                                    }}
                                    onDeleted={(id) => {
                                        if (onDeleted) onDeleted(id)
                                    }}
                                />
                            ) : (
                                <div className="d-flex flex-row modal-komen">
                                    {selectedData?.file_path ? (
                                        <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center" style={{ maxWidth: "50%" }}>
                                            {selectedData.file_path ? (
                                                <>
                                                    {fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif") ? (
                                                        <img
                                                            src={`/storage/${selectedData.file_path}`}
                                                            alt={selectedData.file_name}
                                                            className="img-fluid"
                                                            style={{ maxHeight: "80vh", objectFit: "contain" }}
                                                        />
                                                    ) : fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi") ? (
                                                        <video
                                                            ref={videoRef}
                                                            src={`/storage/${selectedData.file_path}`}
                                                            controls
                                                            autoPlay={!previewBukti}
                                                            loop
                                                            className="w-100"
                                                            style={{ maxHeight: "80vh", objectFit: "contain" }}
                                                        />
                                                    ) : fileName.endsWith(".pdf") ? (
                                                        <embed
                                                            src={`/storage/${selectedData.file_path}`}
                                                            type="application/pdf"
                                                            className="pdf-preview"
                                                        />
                                                    ) : (
                                                        <div className="p-3 text-center text-white">
                                                            <i className="bi bi-file-earmark-text fs-1"></i>
                                                            <p className="mb-1">Dokumen Terlampir: {selectedData.file_name}</p>
                                                            <a href={`/storage/${selectedData.file_path}`} target="_blank" className="btn btn-primary btn-sm">
                                                                <i className="bi bi-download"></i> Unduh
                                                            </a>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-muted">Tidak ada media</div>
                                            )}
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    <div className="flex-fill d-flex flex-column" style={selectedData?.file_path ? { maxWidth: "50%" } : { maxWidth: "100%" }}>
                                        <div className="p-3 border-bottom caption-section">
                                            {(userData.nik === selectedData.nik_warga && role === 'warga') ? (
                                                <div className="d-flex justify-between">
                                                    <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                                    <Role role="warga">
                                                        <button onClick={toggleEdit} title="Edit Pengaduan">
                                                            <i className="far fa-edit"></i>
                                                        </button>
                                                    </Role>
                                                </div>
                                            ) : (role.includes('rt') || role.includes('rw')) ? (
                                                <div className="d-flex justify-between">
                                                    <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                                    <Role role={selectedData.level === 'rt' ? "rt" : "rw"}>
                                                        {(selectedData.konfirmasi_rw === 'sudah') && (
                                                            <input type="checkbox"
                                                                name="selesai"
                                                                title="Selesai"
                                                                checked={selectedData.status === 'selesai'}
                                                                onChange={(e) => handleCheckboxChange(e.target.checked)}
                                                            />
                                                        )}
                                                    </Role>
                                                </div>
                                            ) : (
                                                <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                            )}
                                            <small className="text-muted">
                                                <strong>
                                                    {selectedData.warga?.nama}
                                                </strong>{" "}
                                                • RT {selectedData.warga?.kartu_keluarga?.rukun_tetangga?.nomor_rt}/RW{" "}
                                                {selectedData.warga?.kartu_keluarga?.rw?.nomor_rw}{" "}
                                                • <FormatWaktu createdAt={selectedData.created_at} />
                                            </small>
                                            <p
                                                ref={textRef}
                                                className={`mt-2 isi-pengaduan ${captionExpanded ? "expanded" : "clamped"}`}
                                            >
                                                {selectedData.isi}
                                            </p>
                                            {isOverflowing && (
                                                <button
                                                    className="btn btn-link p-0 mt-1 text-decoration-none"
                                                    onClick={() => setCaptionExpanded(!captionExpanded)}
                                                >
                                                    {captionExpanded ? "lebih sedikit" : "selengkapnya"}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-grow-1 overflow-auto p-3 komen-section" ref={komenRef}>
                                            {komentar.length > 0 ? (
                                                komentar.map((komen, i) => (
                                                    <div key={i} className="mb-3">
                                                        <small className="fw-bold"><strong>{komen.user?.nama}</strong></small>{" "}
                                                        <small className="text-muted">
                                                            • <FormatWaktu createdAt={komen.created_at} />
                                                        </small>
                                                        {(komen.file_path && komen.file_name) && (
                                                            <div
                                                                className="flex-fill border-end bg-black d-flex align-items-center justify-content-center mb-2 mt-2"
                                                                style={{
                                                                    width: "200px",
                                                                    height: "200px",
                                                                    overflow: "hidden",
                                                                    borderRadius: "10px",
                                                                    position: "relative",
                                                                }}>
                                                                {komen.file_name.endsWith(".jpg") || komen.file_name.endsWith(".jpeg") || komen.file_name.endsWith(".png") || komen.file_name.endsWith(".gif") ? (
                                                                    <img
                                                                        src={getFileUrl(komen.file_path)}
                                                                        alt="Preview"
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain"
                                                                        }}
                                                                    />
                                                                ) : komen.file_name.endsWith(".mp4") || komen.file_name.endsWith(".webm") || komen.file_name.endsWith(".avi") ? (
                                                                    <video
                                                                        ref={komenVideoRef}
                                                                        src={getFileUrl(komen.file_path)}
                                                                        controls
                                                                        loop
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain",
                                                                            backgroundColor: "black"
                                                                        }}
                                                                    />
                                                                ) : komen.file_name.endsWith(".pdf") ? (
                                                                    <embed
                                                                        src={getFileUrl(komen.file_path)}
                                                                        type="application/pdf"
                                                                        className="pdf-preview"
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            backgroundColor: "black"
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <p style={{ color: "white", textAlign: "center" }}>
                                                                        File dipilih: {komen.file_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p
                                                            className={`mb-2 komen ${commentExpanded[komen.id]
                                                                ? "line-clamp-none"
                                                                : "line-clamp-3"
                                                                }`}
                                                        >
                                                            {komen.isi_komentar}
                                                        </p>

                                                        {komen.isi_komentar?.length > 100 && (
                                                            <button
                                                                className="btn-expand btn btn-link p-0 text-decoration-none mt-0"
                                                                onClick={() => toggleExpand(komen.id)}
                                                            >
                                                                {commentExpanded[komen.id]
                                                                    ? "lebih sedikit"
                                                                    : "selengkapnya"}
                                                            </button>
                                                        )}
                                                        <hr className="my-0" />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted">Belum ada komentar</p>
                                            )}
                                        </div>
                                        <div className="komen p-3 border-top">
                                            {(role === 'rt' && !isConfirm) ? (
                                                <button className="btn btn-primary w-100" type="button" onClick={handleConfirm}>
                                                    <i className="fas fa-check mr-2"></i>
                                                    Konfirmasi
                                                </button>
                                            ) : (
                                                <>
                                                    {previewBukti && (
                                                        <div
                                                            className="flex-fill border-end bg-black d-flex align-items-center justify-content-center mb-3"
                                                            style={{
                                                                width: "200px",
                                                                height: "200px",
                                                                overflow: "hidden",
                                                                borderRadius: "10px",
                                                                position: "relative",
                                                            }}>
                                                            <button
                                                                onClick={handleClear}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "5px",
                                                                    right: "5px",
                                                                    zIndex: 10,
                                                                    background: "rgba(0, 0, 0, 0.5)",
                                                                    color: "white",
                                                                    border: "none",
                                                                    borderRadius: "50%",
                                                                    width: "25px",
                                                                    height: "25px",
                                                                    cursor: "pointer",
                                                                    fontWeight: "bold",
                                                                    lineHeight: "1",
                                                                }}
                                                                title="Hapus file"
                                                            >
                                                                ✕
                                                            </button>
                                                            <div id="preview" style={{ width: "100%", height: "100%" }}>
                                                                {previewBukti && previewBukti.type === "image" && (
                                                                    <img
                                                                        src={getFileUrl(previewBukti.src)}
                                                                        alt="Preview"
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain"
                                                                        }}
                                                                    />
                                                                )}
                                                                {previewBukti && previewBukti.type === "video" && (
                                                                    <video
                                                                        ref={previewVideoRef}
                                                                        src={getFileUrl(previewBukti.src)}
                                                                        controls
                                                                        autoPlay
                                                                        loop
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain",
                                                                            backgroundColor: "black"
                                                                        }}
                                                                    />
                                                                )}
                                                                {previewBukti && previewBukti.type === "pdf" && (
                                                                    <embed
                                                                        src={getFileUrl(previewBukti.src)}
                                                                        type="application/pdf"
                                                                        className="pdf-preview"
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            backgroundColor: "black"
                                                                        }}
                                                                    />
                                                                )}
                                                                {previewBukti && previewBukti.type === "other" && (
                                                                    <p style={{ color: "white", textAlign: "center" }}>
                                                                        File dipilih: {previewBukti.name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="form-control komen"
                                                            placeholder="Tambah komentar..."
                                                            value={data.isi_komentar}
                                                            onChange={(e) => setData("isi_komentar", e.target.value)}
                                                            title="Masukkan Pesan"
                                                        />
                                                        <Role role={['rt', 'rw']}>
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                id="fileInput"
                                                                name="file"
                                                                className="d-none"
                                                                onChange={handleFileChange}
                                                            />
                                                            <button
                                                                className="btn komen btn-primary my-0"
                                                                type="button"
                                                                onClick={() => document.getElementById('fileInput').click()}
                                                                title="Masukkan Lampiran"
                                                            >
                                                                <i className="fas fa-paperclip"></i>
                                                            </button>
                                                        </Role>
                                                        <button
                                                            className="btn komen btn-primary my-0"
                                                            type="button"
                                                            onClick={handleSubmit}
                                                            title="Kirim Pesan"
                                                        >
                                                            <i className="far fa-paper-plane"></i>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function EditPengaduan({ toggle, onUpdated, onDeleted, pengaduan }) {
    const { data, setData } = useForm({
        judul: pengaduan.judul || "",
        isi: pengaduan.isi || "",
        level: pengaduan.level || "",
        file: null,
    }, { forceFormData: true })

    const [previewUrl, setPreviewUrl] = useState(null)
    const [showAlert, setShowAlert] = useState(false)

    const deletePengaduan = () => {
        setShowAlert(true)
    }

    const confirmDelete = (e) => {
        e.preventDefault()
        setShowAlert(false)

        axios.delete(`/warga/pengaduan/${pengaduan.id}`)
            .then(res => {
                console.log(res.data.message)
                if (onDeleted) {
                    onDeleted(pengaduan.id)
                }
            })
            .catch(err => {
                console.error("Gagal hapus:", err.response?.data || err)
            })
    }

    const cancelDelete = (e) => {
        e.preventDefault()
        setShowAlert(false)
    }

    useEffect(() => {
        if (!pengaduan?.file_path) return

        const fileName = pengaduan.file_path.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            setPreviewUrl({ type: "image", src: pengaduan.file_path })
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi")) {
            setPreviewUrl({ type: "video", src: pengaduan.file_path })
        } else if (fileName.endsWith(".pdf")) {
            setPreviewUrl({ type: "pdf", src: pengaduan.file_path })
        } else {
            setPreviewUrl({ type: "other", name: pengaduan.file_name })
        }
    }, [pengaduan])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") toggle()
        }
        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [toggle])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (!selectedFile) {
            setPreviewUrl(null)
            setData("file", null)
            return
        }

        setData("file", selectedFile || null)

        const fileName = selectedFile.name.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewUrl({ type: "image", src: ev.target.result })
            reader.readAsDataURL(selectedFile)
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi")) {
            setPreviewUrl({ type: "video", src: URL.createObjectURL(selectedFile) })
        } else if (fileName.endsWith(".pdf")) {
            setPreviewUrl({ type: "pdf", src: URL.createObjectURL(selectedFile) })
        } else {
            setPreviewUrl({ type: "other", name: selectedFile.name })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('judul', data.judul)
        formData.append('isi', data.isi)
        formData.append('level', data.level)
        if (data.file) formData.append('file', data.file)
        formData.append('_method', 'PUT')

        axios.post(`/warga/pengaduan/${pengaduan.id}`, formData)
            .then(res => {
                if (onUpdated) {
                    onUpdated({
                        ...pengaduan,
                        ...res.data
                    })
                }
            })
            .catch(err => {
                console.error('Error:', err.response?.data || err)
            })
    }

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    return (
        <div className="d-flex flex-row modal-komen">
            {previewUrl ? (
                <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center" style={{ maxWidth: "50%" }}>
                    <div id="preview">
                        {previewUrl && previewUrl.type === "image" && (
                            <img
                                src={getFileUrl(previewUrl.src)}
                                alt="Preview"
                                style={{ maxHeight: "80vh", objectFit: "contain" }}
                            />
                        )}
                        {previewUrl && previewUrl.type === "video" && (
                            <video
                                src={getFileUrl(previewUrl.src)}
                                controls
                                autoPlay
                                loop
                                style={{ maxHeight: "80vh", objectFit: "contain" }}
                            />
                        )}
                        {previewUrl && previewUrl.type === "pdf" && (
                            <embed
                                src={getFileUrl(previewUrl.src)}
                                type="application/pdf"
                                className="pdf-preview"
                            />
                        )}
                        {previewUrl && previewUrl.type === "other" && <p>File dipilih: {previewUrl.name}</p>}
                    </div>
                </div>
            ) : (
                ""
            )}
            <div className="flex-fill d-flex flex-column" style={previewUrl ? { maxWidth: "50%" } : { maxWidth: "100%" }}>
                <div className="p-3" style={{ height: "100%" }}>
                    <div className="d-flex justify-content-end w-100 mb-2">
                        <button
                            type="button"
                            onClick={() => toggle()}
                            title="Kembali"
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Judul</label>
                            <input
                                name="judul"
                                type="text"
                                className="edit-judul form-control"
                                value={data.judul}
                                onChange={(e) => setData("judul", e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Isi</label>
                            <textarea
                                name="isi"
                                className="edit-isi form-control"
                                rows="4"
                                value={data.isi}
                                onChange={(e) => setData("isi", e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Tujuan Pengaduan: </label>
                            <select
                                name="level"
                                className="edit-tujuan form-select"
                                value={data.level}
                                onChange={(e) => setData("level", e.target.value)}
                            >
                                <option value="rt">RT</option>
                                <option value="rw">RW</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <input
                                type="file"
                                id="fileInput"
                                name="file"
                                className="d-none"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                className="edit-file btn btn-outline-primary m-0"
                                title="Upload File"
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <i className="fas fa-upload mr-2"></i>
                                <small>
                                    Upload File
                                </small>
                            </button>
                            {pengaduan?.file_name && !data.file && (
                                <small className="text-muted d-block mt-2">
                                    File lama: {pengaduan.file_name}
                                </small>
                            )}
                            {data.file && (
                                <small className="text-success d-block mt-2">
                                    File dipilih: {data.file.name}
                                </small>
                            )}
                        </div>

                        <div className="d-flex justify-content-between" style={{ marginTop: "auto" }}>
                            <button
                                type="button"
                                onClick={deletePengaduan}
                                className="btn btn-danger"
                            >
                                <i className="fas fa-trash mr-2"></i>
                                Hapus
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="fas fa-save mr-2"></i>
                                Simpan
                            </button>
                        </div>
                        {showAlert && (
                            <div className="alert-popup border rounded p-3 mt-3 bg-light shadow">
                                <p className="mb-2">Yakin mau hapus pengaduan ini?</p>
                                <div className="d-flex gap-2">
                                    <button type="button" onClick={confirmDelete} className="btn btn-danger">Ya, hapus</button>
                                    <button type="button" onClick={cancelDelete} className="btn btn-secondary">Batal</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export function TambahPengaduan({ tambahShow, onClose, onAdded }) {
    const { data, setData, put, processing, errors } = useForm({
        judul: "",
        isi: "",
        level: "",
        file: null,
    }, { forceFormData: true })

    const [previewUrl, setPreviewUrl] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (!selectedFile) {
            setPreviewUrl(null)
            setData("file", null)
            return
        }

        setData("file", selectedFile || null)

        const fileName = selectedFile.name.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewUrl({ type: "image", src: ev.target.result })
            reader.readAsDataURL(selectedFile)
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi")) {
            setPreviewUrl({ type: "video", src: URL.createObjectURL(selectedFile) })
        } else if (fileName.endsWith(".pdf")) {
            setPreviewUrl({ type: "pdf", src: URL.createObjectURL(selectedFile) })
        } else {
            setPreviewUrl({ type: "other", name: selectedFile.name })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('judul', data.judul)
        formData.append('isi', data.isi)
        formData.append('level', data.level)
        if (data.file) formData.append('file', data.file)

        axios.post('/warga/pengaduan', formData)
            .then(res => {
                if (onAdded) {
                    onAdded(res.data)
                }
                setData({
                    judul: "",
                    isi: "",
                    level: "",
                    file: null,
                })
                setPreviewUrl(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
                onClose()
            })
            .catch(err => {
                console.error('Error:', err.response?.data || err)
            })

    }

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    if (!tambahShow) return null

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)"
                }}
                onClick={() => {
                    onClose()
                }}
            >
                <div
                    className="modal-dialog modal-komen modal-lg modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content modal-komen shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex flex-row modal-komen">
                                {previewUrl ? (
                                    <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center" style={{ maxWidth: "50%" }}>
                                        <div id="preview">
                                            {previewUrl && previewUrl.type === "image" && (
                                                <img
                                                    src={getFileUrl(previewUrl.src)}
                                                    alt="Preview"
                                                    style={{ maxHeight: "80vh", objectFit: "contain" }}
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "video" && (
                                                <video
                                                    src={getFileUrl(previewUrl.src)}
                                                    controls
                                                    autoPlay
                                                    loop
                                                    style={{ maxHeight: "80vh", objectFit: "contain" }}
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "pdf" && (
                                                <embed
                                                    src={getFileUrl(previewUrl.src)}
                                                    type="application/pdf"
                                                    className="pdf-preview"
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "other" && <p>File dipilih: {previewUrl.name}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    ""
                                )}
                                <div className="flex-fill d-flex flex-column" style={previewUrl ? { maxWidth: "50%" } : { maxWidth: "100%" }}>
                                    <div className="p-3" style={{ height: "100%" }}>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="form-label">Judul</label>
                                                <input
                                                    name="judul"
                                                    type="text"
                                                    className="tambah-judul form-control"
                                                    value={data.judul}
                                                    onChange={(e) => setData("judul", e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Isi</label>
                                                <textarea
                                                    name="isi"
                                                    className="edit-isi form-control"
                                                    rows="4"
                                                    value={data.isi}
                                                    onChange={(e) => setData("isi", e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Tujuan Pengaduan: </label>
                                                <select
                                                    name="level"
                                                    className="edit-tujuan form-select"
                                                    value={data.level}
                                                    onChange={(e) => setData("level", e.target.value)}
                                                >
                                                    <option value="">...</option>
                                                    <option value="rt">RT</option>
                                                    <option value="rw">RW</option>
                                                </select>
                                            </div>

                                            <div className="mb-3">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    id="fileInput"
                                                    name="file"
                                                    className="d-none"
                                                    onChange={handleFileChange}
                                                />
                                                <button
                                                    type="button"
                                                    className="edit-file btn btn-outline-primary m-0"
                                                    title="Upload File"
                                                    onClick={() => document.getElementById('fileInput').click()}
                                                >
                                                    <i className="fas fa-upload mr-2"></i>
                                                    <small>
                                                        Upload File
                                                    </small>
                                                </button>
                                                {data.file && (
                                                    <small className="text-success d-block mt-2">
                                                        File dipilih: {data.file.name}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="d-flex justify-content-end" style={{ marginTop: "auto" }}>
                                                <button type="submit" className="btn btn-primary">
                                                    <i className="fas fa-save mr-2"></i>
                                                    Simpan
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function DetailKK({ selectedData, detailShow, onClose, role }) {
    if (!detailShow || !selectedData) return null

    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isPdf, setIsPdf] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [viewDoc, setViewDoc] = useState(null)

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    const kepala = selectedData.warga?.find(
        (w) =>
            w.status_hubungan_dalam_keluarga?.toLowerCase() === "kepala keluarga"
    )

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        setSelectedFile(file)
        const ext = file.name.split(".").pop().toLowerCase()
        setIsPdf(ext === "pdf")

        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
    }

    const handleUpload = async (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append("kk_file", selectedFile)
        formData.append("_method", "PUT")

        axios.post(`/rt/kartu_keluarga/${selectedData.no_kk}/upload-foto`, formData)
            .then(res => {
                console.log("Upload sukses:", res.data)
                alert("Dokumen berhasil diunggah!")
            })
            .catch(err => {
                console.error("Upload gagal:", err.response?.data || err)
                alert("Gagal upload file, cek console/log Laravel.")
            })
    }

    const handleDelete = () => {
        if (!window.confirm("Yakin hapus dokumen ini?")) return

        axios.delete(`/${role}/kartu_keluarga/${selectedData.no_kk}/delete-foto`)
            .then(() => {
                alert("Dokumen berhasil dihapus!")
            })
            .catch((err) => {
                console.error(err)
                alert("Gagal menghapus dokumen!")
            })
    }

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                onClick={onClose}
            >
                <div
                    className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title text-white">Detail Kartu Keluarga</h5>
                        </div>

                        <div className="modal-body kk d-block p-4">
                            <div className="kk-header w-100">
                                <div className="kk-header-top-line">
                                    <div className="kk-header-left-space">
                                    </div>
                                    <div className="kk-header-right-reg">
                                        {selectedData.no_registrasi && (
                                            <p>No. Registrasi:
                                                <strong>{selectedData.no_registrasi}</strong>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="kk-header-main-title">
                                    <h4>KARTU KELUARGA</h4>
                                    <p className="no-kk-big">No. KK: <strong>{selectedData.no_kk}</strong></p>
                                </div>
                            </div>

                            <div className="kk-info-grid mb-2">
                                <div className="kk-info-item">
                                    <p><strong>Nama Kepala Keluarga</strong> : {kepala.nama ?? '-'}</p>
                                    <p><strong>Alamat</strong> : {selectedData.alamat ?? '-'}</p>
                                    <p><strong>RT/RW</strong> :{" "}
                                        {selectedData.rukun_tetangga.nomor_rt ?? '-'}/{selectedData.rw.nomor_rw ?? '-'}
                                    </p>
                                    <p><strong>Desa/Kelurahan</strong> : {selectedData.kelurahan ?? '-'}</p>
                                </div>
                                <div className="kk-info-item">
                                    <p><strong>Kecamatan</strong> : {selectedData.kecamatan ?? '-'}</p>
                                    <p><strong>Kabupaten/Kota</strong> : {selectedData.kabupaten ?? '-'}</p>
                                    <p><strong>Kode Pos</strong> : {selectedData.kode_pos ?? '-'}</p>
                                    <p><strong>Provinsi</strong> : {selectedData.provinsi ?? '-'}</p>
                                </div>
                            </div>

                            <hr className="my-2" style={{ borderTop: "2px solid #e0e0e0", width: "100%" }} />

                            <h6 className="fw-bold text-center mb-3 mt-2">
                                DAFTAR ANGGOTA KELUARGA
                            </h6>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-sm align-middle">
                                    <thead className="table-success text-center small">
                                        <tr>
                                            <th rowSpan="2">No.</th>
                                            <th rowSpan="2">Nama Lengkap</th>
                                            <th rowSpan="2">NIK</th>
                                            <th rowSpan="2">Jenis Kelamin</th>
                                            <th colSpan="2">Tempat, Tanggal Lahir</th>
                                            <th rowSpan="2">Agama</th>
                                            <th rowSpan="2">Pendidikan</th>
                                            <th rowSpan="2">Jenis Pekerjaan</th>
                                            <th rowSpan="2">Golongan Darah</th>
                                            <th rowSpan="2">Status Perkawinan</th>
                                            <th rowSpan="2">Status Hubungan Dalam Keluarga</th>
                                            <th rowSpan="2">Kewarganegaraan</th>
                                            <th colSpan="2">Dokumen Imigrasi</th>
                                            <th colSpan="2">Nama Orang Tua</th>
                                            <th rowSpan="2">Status Warga</th>
                                        </tr>
                                        <tr>
                                            <th>Tempat Lahir</th>
                                            <th>Tanggal Lahir</th>
                                            <th>No. Paspor</th>
                                            <th>No. KITAS/KITAP</th>
                                            <th>Nama Ayah</th>
                                            <th>Nama Ibu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        {selectedData?.warga && selectedData.warga.length > 0 ? (
                                            selectedData.warga
                                                .sort((a, b) => {
                                                    const getRank = (hubungan) => {
                                                        if (hubungan === "Kepala Keluarga") return 2
                                                        if (hubungan === "Istri") return 1
                                                        return 0
                                                    }
                                                    return getRank(b.status_hubungan_dalam_keluarga) - getRank(a.status_hubungan_dalam_keluarga)
                                                })
                                                .map((data, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center">{index + 1}</td>
                                                        <td className="text-center">{data.nama ?? '-'}</td>
                                                        <td className="text-center">{data.nik ?? '-'}</td>
                                                        <td className="text-center">{data.jenis_kelamin.charAt(0).toUpperCase() + data.jenis_kelamin.slice(1) ?? '-'}</td>
                                                        <td>{data.tempat_lahir ?? '-'}</td>
                                                        <td className="text-center">
                                                            {formatTanggal(data.tanggal_lahir)}
                                                        </td>
                                                        <td className="text-center">{data.agama ?? '-'}</td>
                                                        <td className="text-center">{data.pendidikan ?? '-'}</td>
                                                        <td className="text-center">{data.pekerjaan ?? '-'}</td>
                                                        <td className="text-center">{data.golongan_darah ?? '-'}</td>
                                                        <td className="text-center">{data.status_perkawinan.charAt(0).toUpperCase() + data.status_perkawinan.slice(1) ?? '-'}</td>
                                                        <td className="text-center">{data.status_hubungan_dalam_keluarga.charAt(0).toUpperCase() + data.status_hubungan_dalam_keluarga.slice(1) ?? '-'}</td>
                                                        <td className="text-center">{data.kewarganegaraan ?? 'WNI'}</td>
                                                        <td className="text-center">{data.no_paspor ?? '-'}</td>
                                                        <td className="text-center">
                                                            {`${data.no_kitas ?? '-'} / ${data.no_kitap ?? '-'}`}
                                                        </td>
                                                        <td className="text-center">{data.nama_ayah ?? '-'}</td>
                                                        <td className="text-center">{data.nama_ibu ?? '-'}</td>
                                                        <td className="text-center">{data.status_warga.charAt(0).toUpperCase() + data.status_warga.slice(1) ?? '-'}</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan="19" className="text-center text-muted p-4">
                                                    Tidak ada anggota keluarga yang terdaftar untuk Kartu Keluarga ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="kk-document-section mt-1">
                                <h6 className="fw-bold mb-3">Unggah / Perbarui Dokumen KK</h6>

                                <form onSubmit={handleUpload} className="input-group mb-2 d-flex">
                                    <input
                                        type="file"
                                        name="kk_file"
                                        className="form-control"
                                        accept=".pdf, .jpg, .jpeg, .png"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        className="btn btn-success m-0"
                                        type="submit"
                                        disabled={uploading}
                                        style={{ borderRadius: '0 0.35rem 0.35rem 0' }}
                                    >
                                        {uploading ? "Mengunggah..." : "Unggah"}
                                    </button>
                                </form>
                                <small className="form-text text-muted">
                                    Format: PDF, JPG, JPEG, PNG (maks. 5MB)
                                </small>

                                {previewUrl && (
                                    <div className="mt-3">
                                        <p className="fw-bold">Preview:</p>
                                        {isPdf ? (
                                            <iframe
                                                src={previewUrl}
                                                style={{ width: "100%", height: "400px" }}
                                            />
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Preview Dokumen"
                                                style={{
                                                    maxWidth: "100%",
                                                    borderRadius: "10px",
                                                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {selectedData.foto_kk && (
                                    <div className="mt-4">
                                        <h6>Dokumen Saat Ini:</h6>
                                        <div className="d-flex align-items-center gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={() =>
                                                    setViewDoc(
                                                        `/storage/${selectedData.foto_kk}`
                                                    )
                                                }
                                            >
                                                <i className="fas fa-eye me-1"></i> Lihat Dokumen
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={handleDelete}
                                            >
                                                <i className="fas fa-trash me-1"></i> Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer bg-light">
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={onClose}
                            >
                                <i className="bi bi-check2-circle"></i> Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {viewDoc && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,0.8)",
                    }}
                    onClick={() => setViewDoc(null)}
                >
                    <div
                        className="modal-dialog modal-xl modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content bg-dark border-0">
                            <div className="modal-body text-center">
                                {viewDoc.endsWith(".pdf") ? (
                                    <iframe
                                        src={viewDoc}
                                        style={{ width: "100%", height: "80vh" }}
                                    />
                                ) : (
                                    <img
                                        src={viewDoc}
                                        alt="Dokumen KK"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: "80vh",
                                            borderRadius: "10px",
                                        }}
                                    />
                                )}
                            </div>
                            <div className="modal-footer border-0 justify-content-center">
                                <button
                                    className="btn btn-light"
                                    onClick={() => setViewDoc(null)}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export function DetailPengumuman({ selectedData, detailShow, onClose, onUpdated, onDeleted, userData, role }) {
    const { data, setData, reset } = useForm({
        isi_komentar: "",
        file: null,
    })
    const [preview, setPreview] = useState({
        show: false,
        type: "",
        src: "",
    })
    const [komentar, setKomentar] = useState([])
    const [captionExpanded, setCaptionExpanded] = useState(false)
    const [commentExpanded, setCommentExpanded] = useState({})
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const [previewFileKomen, setPreviewFileKomen] = useState(null)
    const videoRef = useRef(null)
    const komenVideoRef = useRef(null)
    const previewVideoRef = useRef(null)
    const fileInputRef = useRef(null)
    const textRef = useRef(null)
    const komenRef = useRef(null)

    const handleClear = () => {
        setData("file", null)
        setPreviewFileKomen(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        videoRef.current.play()
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (!selectedFile) {
            setPreviewFileKomen(null)
            setData("file", null)
            return
        }

        setData("file", selectedFile || null)

        const fileName = selectedFile.name.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewFileKomen({ type: "image", src: ev.target.result })
            reader.readAsDataURL(selectedFile)
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi")) {
            setPreviewFileKomen({ type: "video", src: URL.createObjectURL(selectedFile) })
        } else if (fileName.endsWith(".pdf")) {
            setPreviewFileKomen({ type: "pdf", src: URL.createObjectURL(selectedFile) })
        } else {
            setPreviewFileKomen({ type: "other", name: selectedFile.name })
        }
    }

    const toggleEdit = () => {
        setIsEdit(!isEdit)
    }

    const toggleExpand = (id) => {
        setCommentExpanded((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    useEffect(() => {
        if (textRef.current) {
            const el = textRef.current
            setIsOverflowing(el.scrollHeight > el.clientHeight)
        }
    }, [selectedData])

    useEffect(() => {
        setKomentar(
            (selectedData?.komen || []).sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )
        )
    }, [selectedData])

    const handleSubmit = () => {
        if (!data.isi_komentar.trim() && !data.file) return

        const formData = new FormData()
        formData.append("isi_komentar", data.isi_komentar)
        if (data.file) formData.append("file", data.file)

        axios.post(`/${role}/pengumuman/${selectedData.id}/komentar`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then(res => {
                setKomentar(prev => [res.data, ...prev])
                reset()
                handleClear()
                if (komenRef.current) {
                    komenRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    })
                }
            })
            .catch(err => {

                console.error(err)
            })
    }

    useEffect(() => {
        const handleEnter = (e) => {
            if (e.key === "Enter") handleSubmit()
        }
        document.addEventListener("keydown", handleEnter)
        return () => document.removeEventListener("keydown", handleEnter)
    }, [data.isi_komentar, selectedData])

    useEffect(() => {
        if (isEdit) return

        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [isEdit, onClose])

    useEffect(() => {
        if (videoRef.current) {
            if ((previewFileKomen && previewFileKomen.type === "video") && videoRef.current) {
                videoRef.current.pause()
            }
        }

        if (komenVideoRef.current) {
            if ((previewFileKomen && previewFileKomen.type === "video") && komenVideoRef.current) {
                komenVideoRef.current.pause()
            }
        }
    }, [previewFileKomen, videoRef, komenVideoRef])

    useEffect(() => {
        const komenVideo = komenVideoRef.current
        const selectedVideo = videoRef.current
        const previewVideo = previewVideoRef.current

        const pauseOthers = (source) => {
            if (source !== komenVideo && komenVideo && !komenVideo.paused) komenVideo.pause()
            if (source !== selectedVideo && selectedVideo && !selectedVideo.paused) selectedVideo.pause()
            if (source !== previewVideo && previewVideo && !previewVideo.paused) previewVideo.pause()
        }

        const handleKomenPlay = () => pauseOthers(komenVideo)
        const handleSelectedPlay = () => pauseOthers(selectedVideo)
        const handlePreviewPlay = () => pauseOthers(previewVideo)

        if (komenVideo) komenVideo.addEventListener("play", handleKomenPlay)
        if (selectedVideo) selectedVideo.addEventListener("play", handleSelectedPlay)
        if (previewVideo) previewVideo.addEventListener("play", handlePreviewPlay)

        return () => {
            if (komenVideo) komenVideo.removeEventListener("play", handleKomenPlay)
            if (selectedVideo) selectedVideo.removeEventListener("play", handleSelectedPlay)
            if (previewVideo) previewVideo.removeEventListener("play", handlePreviewPlay)
        }
    }, [previewFileKomen,
        komenVideoRef.current,
        videoRef.current,
        previewVideoRef.current])

    if (!detailShow || !selectedData) return null

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    const fileName = selectedData.dokumen_name?.toLowerCase() || ""

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)"
                }}
                onClick={() => {
                    onClose()
                    setIsEdit(false)
                }}
            >
                <div
                    className="modal-dialog modal-komen modal-lg modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content modal-komen shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            {isEdit ? (
                                <EditPengumuman
                                    toggle={toggleEdit}
                                    pengumuman={selectedData}
                                    onUpdated={(updatedPengumuman) => {
                                        onUpdated(updatedPengumuman)
                                        setIsEdit(false)
                                    }}
                                    onDeleted={(id) => {
                                        if (onDeleted) onDeleted(id)
                                    }}
                                    role={role}
                                />
                            ) : (
                                <div className="d-flex flex-row modal-komen">
                                    {selectedData?.dokumen_path ? (
                                        <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center" style={{ maxWidth: "50%" }}>
                                            {selectedData.dokumen_path ? (
                                                <>
                                                    {fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif") ? (
                                                        <img
                                                            src={`/storage/${selectedData.dokumen_path}`}
                                                            alt={selectedData.dokumen_name}
                                                            className="img-fluid"
                                                            style={{ maxHeight: "80vh", objectFit: "contain" }}
                                                        />
                                                    ) : fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi") ? (
                                                        <video
                                                            ref={videoRef}
                                                            src={`/storage/${selectedData.dokumen_path}`}
                                                            controls
                                                            autoPlay
                                                            loop
                                                            style={{ maxHeight: "80vh", objectFit: "contain", width: "100%" }}
                                                        />
                                                    ) : fileName.endsWith(".pdf") ? (
                                                        <embed
                                                            src={`/storage/${selectedData.dokumen_path}`}
                                                            type="application/pdf"
                                                            className="pdf-preview"
                                                        />
                                                    ) : (
                                                        <div className="p-3 text-center text-white">
                                                            <i className="bi bi-file-earmark-text fs-1"></i>
                                                            <p className="mb-1">Dokumen Terlampir: {selectedData.dokumen_name}</p>
                                                            <Link href={`/storage/${selectedData.dokumen_path}`} target="_blank" className="btn btn-primary btn-sm">
                                                                <i className="bi bi-download"></i> Unduh
                                                            </Link>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-muted">Tidak ada media</div>
                                            )}
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    <div className="flex-fill d-flex flex-column" style={selectedData?.dokumen_path ? { maxWidth: "50%" } : { maxWidth: "100%" }}>
                                        <div className="p-3 border-bottom caption-section">
                                            {(userData.rukun_tetangga?.id === selectedData.id_rt || userData.rw?.id === selectedData.id_rw) ? (
                                                <div className="d-flex justify-between">
                                                    <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                                    <Role role={selectedData.rukun_tetangga ? "rt" : "rw"}>
                                                        <button onClick={toggleEdit} title="Edit Pengumuman">
                                                            <i className="far fa-edit"></i>
                                                        </button>
                                                    </Role>
                                                </div>
                                            ) : (
                                                <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                            )}
                                            <small className="text-muted">
                                                <strong>
                                                    {selectedData.rukun_tetangga ? selectedData.rukun_tetangga.nama_ketua_rt : selectedData.rw.nama_ketua_rw}
                                                </strong> • {" "}
                                                RT {selectedData.rukun_tetangga?.nomor_rt}/{""}
                                                RW {selectedData.rw?.nomor_rw}{" "}
                                                • <FormatWaktu createdAt={selectedData.created_at} />
                                            </small>
                                            <p
                                                ref={textRef}
                                                className={`mt-2 isi-pengumuman ${captionExpanded ? "expanded" : "clamped"}`}
                                            >
                                                {selectedData.isi}
                                            </p>
                                            {
                                                isOverflowing && (
                                                    <button
                                                        className="btn btn-link p-0 mt-1 text-decoration-none"
                                                        onClick={() => setCaptionExpanded(!captionExpanded)}
                                                    >
                                                        {captionExpanded ? "lebih sedikit" : "selengkapnya"}
                                                    </button>
                                                )
                                            }
                                        </div>
                                        <div className="flex-grow-1 overflow-auto p-3 komen-section" ref={komenRef}>
                                            {komentar.length > 0 ? (
                                                komentar.map((komen, i) => (
                                                    <div key={i} className="mb-3">
                                                        <small className="fw-bold"><strong>{komen.user?.nama}</strong></small>{" "}
                                                        <small className="text-muted">
                                                            • <FormatWaktu createdAt={komen.created_at} />
                                                        </small>
                                                        {(komen.file_path && komen.file_name) && (
                                                            <div
                                                                className="flex-fill border-end bg-black d-flex align-items-center justify-content-center mb-2 mt-2"
                                                                style={{
                                                                    width: "200px",
                                                                    height: "200px",
                                                                    overflow: "hidden",
                                                                    borderRadius: "10px",
                                                                    position: "relative",
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={() =>
                                                                        setPreview({
                                                                            show: true,
                                                                            type: komen.file_name.endsWith(".pdf")
                                                                                ? "pdf"
                                                                                : komen.file_name.match(/\.(mp4|webm|avi)$/)
                                                                                    ? "video"
                                                                                    : "image",
                                                                            src: getFileUrl(komen.file_path),
                                                                        })
                                                                    }
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: "5px",
                                                                        right: "5px",
                                                                        zIndex: 10,
                                                                        background: "rgba(0, 0, 0, 0.5)",
                                                                        color: "white",
                                                                        border: "none",
                                                                        borderRadius: "50%",
                                                                        width: "25px",
                                                                        height: "25px",
                                                                        cursor: "pointer",
                                                                        fontWeight: "bold",
                                                                        lineHeight: "1",
                                                                    }}
                                                                    title="Hapus file"
                                                                >
                                                                    <i className="fa-solid fa-expand"></i>
                                                                </button>
                                                                {komen.file_name.match(/\.(jpg|jpeg|png|gif)$/) ? (
                                                                    <img
                                                                        src={getFileUrl(komen.file_path)}
                                                                        alt="Preview"
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain",
                                                                        }}
                                                                    />
                                                                ) : komen.file_name.match(/\.(mp4|webm|avi)$/) ? (
                                                                    <video
                                                                        ref={komenVideoRef}
                                                                        src={getFileUrl(komen.file_path)}
                                                                        controls
                                                                        loop
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain",
                                                                            backgroundColor: "black",
                                                                        }}
                                                                    />
                                                                ) : komen.file_name.endsWith(".pdf") ? (
                                                                    <embed
                                                                        src={getFileUrl(komen.file_path)}
                                                                        type="application/pdf"
                                                                        className="pdf-preview"
                                                                        style={{
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            backgroundColor: "black",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <p style={{ color: "white", textAlign: "center" }}>
                                                                        File dipilih: {komen.file_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p
                                                            className={`mb-2 komen ${commentExpanded[komen.id]
                                                                ? "line-clamp-none"
                                                                : "line-clamp-3"
                                                                }`}
                                                        >
                                                            {komen.isi_komentar}
                                                        </p>

                                                        {komen.isi_komentar?.length > 100 && (
                                                            <button
                                                                className="btn-expand btn btn-link p-0 text-decoration-none mt-0"
                                                                onClick={() => toggleExpand(komen.id)}
                                                            >
                                                                {commentExpanded[komen.id]
                                                                    ? "lebih sedikit"
                                                                    : "selengkapnya"}
                                                            </button>
                                                        )}
                                                        <hr className="my-0" />
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted">Belum ada komentar</p>
                                            )}
                                            {preview.show && (
                                                <div
                                                    className="preview-overlay"
                                                    onClick={() => setPreview({ show: false, src: "", type: "" })}
                                                    style={{
                                                        position: "fixed",
                                                        top: 0,
                                                        left: 0,
                                                        width: "100vw",
                                                        height: "100vh",
                                                        background: "rgba(0,0,0,0.8)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        zIndex: 9999,
                                                    }}
                                                >
                                                    {preview.type === "image" ? (
                                                        <img
                                                            src={preview.src}
                                                            alt="Preview"
                                                            style={{
                                                                maxWidth: "90%",
                                                                maxHeight: "90%",
                                                                objectFit: "contain",
                                                                borderRadius: "10px",
                                                            }}
                                                        />
                                                    ) : preview.type === "video" ? (
                                                        <video
                                                            src={preview.src}
                                                            controls
                                                            autoPlay
                                                            style={{
                                                                maxWidth: "90%",
                                                                maxHeight: "90%",
                                                                borderRadius: "10px",
                                                                backgroundColor: "black",
                                                            }}
                                                        />
                                                    ) : preview.type === "pdf" ? (
                                                        <embed
                                                            src={preview.src}
                                                            type="application/pdf"
                                                            style={{
                                                                width: "80%",
                                                                height: "90%",
                                                                borderRadius: "10px",
                                                                backgroundColor: "white",
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                        <div className="komen p-3 border-top">
                                            {previewFileKomen && (
                                                <div
                                                    className="flex-fill border-end bg-black d-flex align-items-center justify-content-center mb-3"
                                                    style={{
                                                        width: "200px",
                                                        height: "200px",
                                                        overflow: "hidden",
                                                        borderRadius: "10px",
                                                        position: "relative",
                                                    }}>
                                                    <button
                                                        onClick={handleClear}
                                                        style={{
                                                            position: "absolute",
                                                            top: "5px",
                                                            right: "5px",
                                                            zIndex: 10,
                                                            background: "rgba(0, 0, 0, 0.5)",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "50%",
                                                            width: "25px",
                                                            height: "25px",
                                                            cursor: "pointer",
                                                            fontWeight: "bold",
                                                            lineHeight: "1",
                                                        }}
                                                        title="Hapus file"
                                                    >
                                                        ✕
                                                    </button>
                                                    <div id="preview" style={{ width: "100%", height: "100%" }}>
                                                        {previewFileKomen && previewFileKomen.type === "image" && (
                                                            <img
                                                                src={getFileUrl(previewFileKomen.src)}
                                                                alt="Preview"
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "100%",
                                                                    objectFit: "contain"
                                                                }}
                                                            />
                                                        )}
                                                        {previewFileKomen && previewFileKomen.type === "video" && (
                                                            <video
                                                                ref={previewVideoRef}
                                                                src={getFileUrl(previewFileKomen.src)}
                                                                controls
                                                                autoPlay
                                                                loop
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "100%",
                                                                    objectFit: "contain",
                                                                    backgroundColor: "black"
                                                                }}
                                                            />
                                                        )}
                                                        {previewFileKomen && previewFileKomen.type === "pdf" && (
                                                            <embed
                                                                src={getFileUrl(previewFileKomen.src)}
                                                                type="application/pdf"
                                                                className="pdf-preview"
                                                                style={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    backgroundColor: "black"
                                                                }}
                                                            />
                                                        )}
                                                        {previewFileKomen && previewFileKomen.type === "other" && (
                                                            <p style={{ color: "white", textAlign: "center" }}>
                                                                File dipilih: {previewFileKomen.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control komen"
                                                    placeholder="Tambah komentar..."
                                                    value={data.isi_komentar}
                                                    onChange={(e) => setData("isi_komentar", e.target.value)}
                                                />
                                                <Role role={['rt', 'rw']}>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        id="fileInput"
                                                        name="file"
                                                        className="d-none"
                                                        onChange={handleFileChange}
                                                    />
                                                    <button
                                                        className="btn komen btn-primary my-0"
                                                        type="button"
                                                        onClick={() => document.getElementById('fileInput').click()}
                                                        title="Masukkan Lampiran"
                                                    >
                                                        <i className="fas fa-paperclip"></i>
                                                    </button>
                                                </Role>
                                                <button className="btn komen btn-primary my-0" type="button" onClick={handleSubmit}>
                                                    <i className="far fa-paper-plane"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function EditPengumuman({ toggle, onUpdated, onDeleted, pengumuman, role }) {
    const { data, setData, put, processing, errors } = useForm({
        judul: pengumuman.judul || "",
        isi: pengumuman.isi || "",
        kategori: pengumuman.kategori || "",
        dokumen: null,
    }, { forceFormData: true })

    const [previewUrl, setPreviewUrl] = useState(null)
    const [showAlert, setShowAlert] = useState(false)

    const deletePengumuman = () => {
        setShowAlert(true)
    }

    const confirmDelete = (e) => {
        e.preventDefault()
        setShowAlert(false)
        console.log("role:", role)
        console.log("delete URL:", `/${role}/pengumuman/${pengumuman.id}`)

        axios.delete(`/${role}/pengumuman/${pengumuman.id}`)
            .then(res => {
                console.log(res.data.message)
                if (onDeleted) {
                    onDeleted(pengumuman.id)
                }
            })
            .catch(err => {
                console.error("Gagal hapus:", err.response?.data || err)
            })
    }

    const cancelDelete = (e) => {
        e.preventDefault()
        setShowAlert(false)
    }

    useEffect(() => {
        if (!pengumuman?.dokumen_path) return

        const fileName = pengumuman.dokumen_path.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            setPreviewUrl({ type: "image", src: pengumuman.dokumen_path })
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi")) {
            setPreviewUrl({ type: "video", src: pengumuman.dokumen_path })
        } else if (fileName.endsWith(".pdf")) {
            setPreviewUrl({ type: "pdf", src: pengumuman.dokumen_path })
        } else {
            setPreviewUrl({ type: "other", name: pengumuman.dokumen_name })
        }
    }, [pengumuman])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") toggle()
        }
        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [toggle])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (!selectedFile) {
            setPreviewUrl(null)
            setData("dokumen", null)
            return
        }

        setData("dokumen", selectedFile || null)

        const fileName = selectedFile.name.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewUrl({ type: "image", src: ev.target.result })
            reader.readAsDataURL(selectedFile)
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi")) {
            setPreviewUrl({ type: "video", src: URL.createObjectURL(selectedFile) })
        } else if (fileName.endsWith(".pdf")) {
            setPreviewUrl({ type: "pdf", src: URL.createObjectURL(selectedFile) })
        } else {
            setPreviewUrl({ type: "other", name: selectedFile.name })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('judul', data.judul)
        formData.append('isi', data.isi)
        formData.append('kategori', data.kategori)
        if (data.dokumen) formData.append('dokumen', data.dokumen)
        formData.append('_method', 'PUT')

        axios.post(`/${role}/pengumuman/${pengumuman.id}`, formData)
            .then(res => {
                if (onUpdated) {
                    onUpdated({
                        ...pengumuman,
                        ...res.data
                    })
                }
            })
            .catch(err => {
                console.error('Error:', err.response?.data || err)
            })
    }

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    return (
        <div className="d-flex flex-row modal-komen">
            {previewUrl ? (
                <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center" style={{ maxWidth: "50%" }}>
                    <div id="preview">
                        {previewUrl && previewUrl.type === "image" && (
                            <img
                                src={getFileUrl(previewUrl.src)}
                                alt="Preview"
                                style={{ maxHeight: "80vh", objectFit: "contain" }}
                            />
                        )}
                        {previewUrl && previewUrl.type === "video" && (
                            <video
                                src={getFileUrl(previewUrl.src)}
                                controls
                                autoPlay
                                loop
                                style={{ maxHeight: "80vh", objectFit: "contain" }}
                            />
                        )}
                        {previewUrl && previewUrl.type === "pdf" && (
                            <embed
                                src={getFileUrl(previewUrl.src)}
                                type="application/pdf"
                                className="pdf-preview"
                            />
                        )}
                        {previewUrl && previewUrl.type === "other" && <p>File dipilih: {previewUrl.name}</p>}
                    </div>
                </div>
            ) : (
                ""
            )}
            <div className="flex-fill d-flex flex-column" style={previewUrl ? { maxWidth: "50%" } : { maxWidth: "100%" }}>
                <div className="p-3" style={{ height: "100%" }}>
                    <div className="d-flex justify-content-end w-100 mb-2">
                        <button
                            type="button"
                            onClick={() => toggle()}
                            title="Kembali"
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Judul</label>
                            <input
                                name="judul"
                                type="text"
                                className="edit-judul form-control"
                                value={data.judul}
                                onChange={(e) => setData("judul", e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Kategori</label>
                            <input
                                name="kategori"
                                type="text"
                                className="edit-kategori form-control"
                                value={data.kategori}
                                onChange={(e) => setData("kategori", e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Isi</label>
                            <textarea
                                name="isi"
                                className="edit-isi form-control"
                                rows="4"
                                value={data.isi}
                                onChange={(e) => setData("isi", e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <div className="mb-3">
                            <input
                                type="file"
                                id="fileInput"
                                name="file"
                                className="d-none"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                className="edit-file btn btn-outline-primary m-0"
                                title="Upload File"
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <i className="fas fa-upload mr-2"></i>
                                <small>
                                    Upload File
                                </small>
                            </button>
                            {pengumuman?.dokumen_name && !data.file && (
                                <small className="text-muted d-block mt-2">
                                    File lama: {pengumuman.dokumen_name}
                                </small>
                            )}
                            {data.file && (
                                <small className="text-success d-block mt-2">
                                    File dipilih: {data.file.name}
                                </small>
                            )}
                        </div>

                        <div className="d-flex justify-content-between" style={{ marginTop: "auto" }}>
                            <button
                                type="button"
                                onClick={deletePengumuman}
                                className="btn btn-danger"
                            >
                                <i className="fas fa-trash mr-2"></i>
                                Hapus
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="fas fa-save mr-2"></i>
                                Simpan
                            </button>
                        </div>
                        {showAlert && (
                            <div className="alert-popup border rounded p-3 mt-3 bg-light shadow">
                                <p className="mb-2">Yakin mau hapus pengumuman ini?</p>
                                <div className="d-flex gap-2">
                                    <button type="button" onClick={confirmDelete} className="btn btn-danger">Ya, hapus</button>
                                    <button type="button" onClick={cancelDelete} className="btn btn-secondary">Batal</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export function TambahPengumuman({ tambahShow, onClose, onAdded, role }) {
    const { data, setData, put, processing, errors } = useForm({
        judul: "",
        kategori: "",
        isi: "",
        dokumen: null,
    }, { forceFormData: true })

    const [previewUrl, setPreviewUrl] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (!selectedFile) {
            setPreviewUrl(null)
            setData("dokumen", null)
            return
        }

        setData("dokumen", selectedFile || null)

        const fileName = selectedFile.name.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewUrl({ type: "image", src: ev.target.result })
            reader.readAsDataURL(selectedFile)
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi")) {
            setPreviewUrl({ type: "video", src: URL.createObjectURL(selectedFile) })
        } else if (fileName.endsWith(".pdf")) {
            setPreviewUrl({ type: "pdf", src: URL.createObjectURL(selectedFile) })
        } else {
            setPreviewUrl({ type: "other", name: selectedFile.name })
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('judul', data.judul)
        formData.append('isi', data.isi)
        formData.append('kategori', data.kategori)
        if (data.dokumen) formData.append('dokumen', data.dokumen)

        axios.post(`/${role}/pengumuman`, formData)
            .then(res => {
                if (onAdded) {
                    onAdded(res.data)
                }
                setData({
                    judul: "",
                    kategori: "",
                    isi: "",
                    dokumen: null,
                })
                setPreviewUrl(null)
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
                onClose()
            })
            .catch(err => {
                console.error('Error:', err.response?.data || err)
            })

    }

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    if (!tambahShow) return null

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)"
                }}
                onClick={() => {
                    onClose()
                }}
            >
                <div
                    className="modal-dialog modal-komen modal-lg modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content modal-komen shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex flex-row modal-komen">
                                {previewUrl ? (
                                    <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center" style={{ maxWidth: "50%" }}>
                                        <div id="preview">
                                            {previewUrl && previewUrl.type === "image" && (
                                                <img
                                                    src={getFileUrl(previewUrl.src)}
                                                    alt="Preview"
                                                    style={{ maxHeight: "80vh", objectFit: "contain" }}
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "video" && (
                                                <video
                                                    src={getFileUrl(previewUrl.src)}
                                                    controls
                                                    autoPlay
                                                    loop
                                                    style={{ maxHeight: "80vh", objectFit: "contain" }}
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "pdf" && (
                                                <embed
                                                    src={getFileUrl(previewUrl.src)}
                                                    type="application/pdf"
                                                    className="pdf-preview"
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "other" && <p>File dipilih: {previewUrl.name}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    ""
                                )}
                                <div className="flex-fill d-flex flex-column" style={previewUrl ? { maxWidth: "50%" } : { maxWidth: "100%" }}>
                                    <div className="p-3" style={{ height: "100%" }}>
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-3">
                                                <label className="form-label">Judul</label>
                                                <input
                                                    name="judul"
                                                    type="text"
                                                    className="tambah-judul form-control"
                                                    value={data.judul}
                                                    onChange={(e) => setData("judul", e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Kategori</label>
                                                <input
                                                    name="kategori"
                                                    type="text"
                                                    className="tambah-kategori form-control"
                                                    value={data.kategori}
                                                    onChange={(e) => setData("kategori", e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Isi</label>
                                                <textarea
                                                    name="isi"
                                                    className="edit-isi form-control"
                                                    rows="4"
                                                    value={data.isi}
                                                    onChange={(e) => setData("isi", e.target.value)}
                                                    required
                                                ></textarea>
                                            </div>

                                            <div className="mb-3">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    id="fileInput"
                                                    name="dokumen"
                                                    className="d-none"
                                                    onChange={handleFileChange}
                                                />
                                                <button
                                                    type="button"
                                                    className="edit-file btn btn-outline-primary m-0"
                                                    title="Upload File"
                                                    onClick={() => document.getElementById('fileInput').click()}
                                                >
                                                    <i className="fas fa-upload mr-2"></i>
                                                    <small>
                                                        Upload File
                                                    </small>
                                                </button>
                                                {data.file && (
                                                    <small className="text-success d-block mt-2">
                                                        File dipilih: {data.dokumen.name}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="d-flex justify-content-end" style={{ marginTop: "auto" }}>
                                                <button type="submit" className="btn btn-primary">
                                                    <i className="fas fa-save mr-2"></i>
                                                    Simpan
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function DetailWarga({ selectedData, detailShow, onClose, userData }) {
    if (!detailShow || !selectedData) return null

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                onClick={onClose}
            >
                <div
                    className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow border-0">
                        <div className="modal-body kk d-block p-4">
                            <div className="kk-header w-100">
                                <div className="kk-header-main-title">
                                    <h4>Detail Warga {userData?.rukun_tetangga
                                        ? `RT ${userData?.rukun_tetangga?.nomor_rt}`
                                        : `RW ${userData?.rw?.nomor_rw}`}
                                    </h4>
                                </div>
                            </div>

                            <div className="kk-info-grid mb-2">
                                <div className="kk-info-item">
                                    <p><strong>Nama Lengkap</strong> : {selectedData.nama ?? '-'}</p>
                                    <p><strong>NIK</strong> : {selectedData.nik ?? '-'}</p>
                                    <p><strong>No. KK</strong> : {selectedData.no_kk ?? '-'}</p>
                                    <p><strong>Alamat</strong> : {selectedData.kartu_keluarga?.alamat ?? '-'}</p>
                                    <p><strong>Jenis Kelamin</strong> : {selectedData.jenis_kelamin.charAt(0).toUpperCase() + selectedData.jenis_kelamin.slice(1) ?? '-'}</p>
                                    <p><strong>Tempat Lahir</strong> : {selectedData.tempat_lahir ?? '-'}</p>
                                    <p><strong>Tanggal Lahir</strong> : {formatTanggal(selectedData.tanggal_lahir) ?? '-'}</p>
                                    <p><strong>Agama</strong> : {selectedData.agama ?? '-'}</p>
                                    <p><strong>Pendidikan</strong> : {selectedData.pendidikan ?? '-'}</p>
                                    <p><strong>Pekerjaan</strong> : {selectedData.pekerjaan ?? '-'}</p>
                                    <p><strong>Status Perkawinan</strong> : {selectedData.status_perkawinan ?? '-'}</p>
                                    <p><strong>Status Hubungan dalam Keluarga</strong> : {selectedData.status_hubungan_dalam_keluarga.charAt(0).toUpperCase() + selectedData.status_hubungan_dalam_keluarga.slice(1) ?? '-'}</p>
                                    <p><strong>Golongan Darah</strong> : {selectedData.golongan_darah ?? '-'}</p>
                                    <p><strong>Kewarganegaraan</strong> : {selectedData.kewarganegaraan ?? '-'}</p>
                                    <p><strong>No Paspor</strong> : {selectedData.no_paspor ?? '-'}</p>
                                    <p><strong>Tanggal Terbit Paspor</strong> : {formatTanggal(selectedData.tgl_terbit_paspor) ?? '-'}</p>
                                    <p><strong>Tanggal Akhir Paspor</strong> : {formatTanggal(selectedData.tgl_berakhir_paspor) ?? '-'}</p>
                                </div>
                                <div className="kk-info-item">
                                    <p><strong>No Paspor</strong> : {selectedData.no_kitas ?? '-'}</p>
                                    <p><strong>Tanggal Terbit Paspor</strong> : {formatTanggal(selectedData.tgl_terbit_kitas) ?? '-'}</p>
                                    <p><strong>Tanggal Akhir Paspor</strong> : {formatTanggal(selectedData.tgl_berakhir_kitas) ?? '-'}</p>
                                    <p><strong>No Paspor</strong> : {selectedData.no_kitap ?? '-'}</p>
                                    <p><strong>Tanggal Terbit Paspor</strong> : {formatTanggal(selectedData.tgl_terbit_kitap) ?? '-'}</p>
                                    <p><strong>Tanggal Akhir Paspor</strong> : {formatTanggal(selectedData.tgl_berakhir_kitap) ?? '-'}</p>
                                    <p><strong>Nama Ayah</strong> : {selectedData.nama_ayah ?? '-'}</p>
                                    <p><strong>Nama Ibu</strong> : {selectedData.nama_ibu ?? '-'}</p>
                                    <p><strong>Alamat Asal</strong> : {selectedData.alamat_asal ?? '-'}</p>
                                    <p><strong>Alamat Domisili</strong> : {selectedData.alamat_domisili ?? '-'}</p>
                                    <p><strong>Tanggal Mulai Tinggal</strong> : {formatTanggal(selectedData.tanggal_mulai_tinggal) ?? '-'}</p>
                                    <p><strong>Tujuan Pindah</strong> : {selectedData.tujuan_pindah ?? '-'}</p>
                                    <p><strong>Status Warga</strong> : {selectedData.status_warga.charAt(0).toUpperCase() + selectedData.status_warga.slice(1) ?? '-'}</p>
                                    <p><strong>RT/RW</strong> :{" "}
                                        {selectedData.kartu_keluarga?.rukun_tetangga?.nomor_rt ?? '-'}/{selectedData.kartu_keluarga?.rw?.nomor_rw ?? '-'}
                                    </p>
                                </div>
                            </div>{console.log(selectedData.kartu_keluarga)}

                            {/* <hr className="my-2" style={{ borderTop: "2px solid #e0e0e0", width: "100%" }} />

                            <h6 className="fw-bold text-center mb-3 mt-2">
                                DAFTAR ANGGOTA KELUARGA
                            </h6>
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-sm align-middle">
                                    <thead className="table-success text-center small">
                                        <tr>
                                            <th rowSpan="2">No.</th>
                                            <th rowSpan="2">Nama Lengkap</th>
                                            <th rowSpan="2">NIK</th>
                                            <th rowSpan="2">Jenis Kelamin</th>
                                            <th colSpan="2">Tempat, Tanggal Lahir</th>
                                            <th rowSpan="2">Agama</th>
                                            <th rowSpan="2">Pendidikan</th>
                                            <th rowSpan="2">Jenis Pekerjaan</th>
                                            <th rowSpan="2">Golongan Darah</th>
                                            <th rowSpan="2">Status Perkawinan</th>
                                            <th rowSpan="2">Status Hubungan Dalam Keluarga</th>
                                            <th rowSpan="2">Kewarganegaraan</th>
                                            <th colSpan="2">Dokumen Imigrasi</th>
                                            <th colSpan="2">Nama Orang Tua</th>
                                            <th rowSpan="2">Status Warga</th>
                                        </tr>
                                        <tr>
                                            <th>Tempat Lahir</th>
                                            <th>Tanggal Lahir</th>
                                            <th>No. Paspor</th>
                                            <th>No. KITAS/KITAP</th>
                                            <th>Nama Ayah</th>
                                            <th>Nama Ibu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        {selectedData?.warga && selectedData.warga.length > 0 ? (
                                            selectedData.warga
                                                .sort((a, b) => {
                                                    const getRank = (hubungan) => {
                                                        if (hubungan === "Kepala Keluarga") return 2
                                                        if (hubungan === "Istri") return 1
                                                        return 0
                                                    }
                                                    return getRank(b.status_hubungan_dalam_keluarga) - getRank(a.status_hubungan_dalam_keluarga)
                                                })
                                                .map((data, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center">{index + 1}</td>
                                                        <td className="text-center">{data.nama ?? '-'}</td>
                                                        <td className="text-center">{data.nik ?? '-'}</td>
                                                        <td className="text-center">{data.jenis_kelamin.charAt(0).toUpperCase() + data.jenis_kelamin.slice(1) ?? '-'}</td>
                                                        <td>{data.tempat_lahir ?? '-'}</td>
                                                        <td className="text-center">
                                                            {formatTanggal(data.tanggal_lahir)}
                                                        </td>
                                                        <td className="text-center">{data.agama ?? '-'}</td>
                                                        <td className="text-center">{data.pendidikan ?? '-'}</td>
                                                        <td className="text-center">{data.pekerjaan ?? '-'}</td>
                                                        <td className="text-center">{data.golongan_darah ?? '-'}</td>
                                                        <td className="text-center">{data.status_perkawinan.charAt(0).toUpperCase() + data.status_perkawinan.slice(1) ?? '-'}</td>
                                                        <td className="text-center">{data.status_hubungan_dalam_keluarga.charAt(0).toUpperCase() + data.status_hubungan_dalam_keluarga.slice(1) ?? '-'}</td>
                                                        <td className="text-center">{data.kewarganegaraan ?? 'WNI'}</td>
                                                        <td className="text-center">{data.no_paspor ?? '-'}</td>
                                                        <td className="text-center">
                                                            {`${data.no_kitas ?? '-'} / ${data.no_kitap ?? '-'}`}
                                                        </td>
                                                        <td className="text-center">{data.nama_ayah ?? '-'}</td>
                                                        <td className="text-center">{data.nama_ibu ?? '-'}</td>
                                                        <td className="text-center">{data.status_warga.charAt(0).toUpperCase() + data.status_warga.slice(1) ?? '-'}</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan="19" className="text-center text-muted p-4">
                                                    Tidak ada anggota keluarga yang terdaftar untuk Kartu Keluarga ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="kk-document-section mt-1">
                                <h6 className="fw-bold mb-3">Unggah / Perbarui Dokumen KK</h6>

                                <form onSubmit={handleUpload} className="input-group mb-2 d-flex">
                                    <input
                                        type="file"
                                        name="kk_file"
                                        className="form-control"
                                        accept=".pdf, .jpg, .jpeg, .png"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        className="btn btn-success m-0"
                                        type="submit"
                                        disabled={uploading}
                                        style={{ borderRadius: '0 0.35rem 0.35rem 0' }}
                                    >
                                        {uploading ? "Mengunggah..." : "Unggah"}
                                    </button>
                                </form>
                                <small className="form-text text-muted">
                                    Format: PDF, JPG, JPEG, PNG (maks. 5MB)
                                </small>

                                {previewUrl && (
                                    <div className="mt-3">
                                        <p className="fw-bold">Preview:</p>
                                        {isPdf ? (
                                            <iframe
                                                src={previewUrl}
                                                style={{ width: "100%", height: "400px" }}
                                            />
                                        ) : (
                                            <img
                                                src={previewUrl}
                                                alt="Preview Dokumen"
                                                style={{
                                                    maxWidth: "100%",
                                                    borderRadius: "10px",
                                                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {selectedData.foto_kk && (
                                    <div className="mt-4">
                                        <h6>Dokumen Saat Ini:</h6>
                                        <div className="d-flex align-items-center gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={() =>
                                                    setViewDoc(
                                                        `/storage/${selectedData.foto_kk}`
                                                    )
                                                }
                                            >
                                                <i className="fas fa-eye me-1"></i> Lihat Dokumen
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={handleDelete}
                                            >
                                                <i className="fas fa-trash me-1"></i> Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div> */}
                        </div>

                        <div className="modal-footer bg-light">
                            <button
                                type="button"
                                className="btn btn-outline-success"
                                onClick={onClose}
                            >
                                <i className="bi bi-check2-circle"></i> Tutup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}