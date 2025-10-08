import React, { useEffect, useRef, useState } from "react"
import { Link, useForm, usePage } from "@inertiajs/react"
import logo from '../../../../public/img/logo.png'
import axios from "axios"
import { FormatWaktu } from "../Warga/Pengaduan"
import { SidebarLink } from "./SidebarLink"
import { getAdminLinks, getWargaLinks } from "./GetPropRole"

export function ModalSidebar({ modalIsOpen, modalShow }) {
    const { url } = usePage()
    const { props } = usePage()
    const role = props.auth?.currentRole

    const isActive = (url, pattern) => {
        return url.startsWith(pattern)
    }

    let statLinks = [];

    switch (role) {
        case "admin":
            statLinks = getAdminLinks();
            break;
        case "rw":
            statLinks = getRwLinks();
            break;
        case "rt":
            statLinks = getRtLinks();
            break;
        case "warga":
            statLinks = getWargaLinks();
            break;
        default:
            statLinks = [];
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
                            <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nomor RW</label>
                            <input type="text" name="nomor_rw" value={form.nomor_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Ketua RW</label>
                            <input type="text" name="nama_ketua_rw" value={form.nama_ketua_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
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
                            <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nomor RW</label>
                            <input type="text" name="nomor_rw" value={form.nomor_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Ketua RW</label>
                            <input type="text" name="nama_ketua_rw" value={form.nama_ketua_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Update</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function AddRtModal({ form, handleChange, handleAdd, onClose }) {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 fade-in">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md animate-scaleIn">
                <form onSubmit={handleAdd} className="p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h5 className="text-lg font-semibold">Tambah RT</h5>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium">NIK</label>
                            <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nomor RT</label>
                            <input type="text" name="nomor_rt" value={form.nomor_rt || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Ketua RT</label>
                            <input type="text" name="nama_ketua_rt" value={form.nama_ketua_rt || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function EditRtModal({ form, handleChange, handleEdit, onClose }) {
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
                            <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nomor RT</label>
                            <input type="text" name="nomor_rt" value={form.nomor_rt || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Ketua RT</label>
                            <input type="text" name="nama_ketua_rt" value={form.nama_ketua_rt || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2"/>
                        </div>
                    </div>
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
    );
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
    );
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
    );
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
    );
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
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content modal-custom">
                    <div className="modal-header">
                        <h5>Atur Permissions untuk Role: <strong>{role.name}</strong></h5>
                        <button type="button" className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            {permissions.length ? (
                                permissions.map((perm) => (
                                    <div key={perm.id} className="col-md-4 mb-2">
                                        <label className="d-flex align-items-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedPerms.includes(perm.name)}
                                                onChange={() => togglePermission(perm.name)}
                                                className="form-check-input me-2"
                                            />
                                            {perm.name}
                                        </label>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-muted">Tidak ada permission tersedia.</div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
                        <button type="button" className="btn btn-primary" onClick={handleSave}>Simpan Permissions</button>
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
    );
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
    );
}

export function DetailPengumuman({ selectedData, detailShow, onClose }) {
    const [komentar, setKomentar] = useState([])
    const [newKomentar, setNewKomentar] = useState("")
    const [captionExpanded, setCaptionExpanded] = useState(false)
    const [commentExpanded, setCommentExpanded] = useState({})
    const [isOverflowing, setIsOverflowing] = useState(false)
    const textRef = useRef(null)
    const komenRef = useRef(null)

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
        if (!newKomentar.trim()) return
        // nanti rutenya bakal diganti sesuai role
        axios.post(`/warga/pengumuman/${selectedData.id}/komentar`, {
            isi_komentar: newKomentar
        })
            .then(res => {
                setKomentar(prev => [res.data, ...prev])
                setNewKomentar("")
                if (komenRef.current) {
                    komenRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    })
                }
            })
            .catch(err => console.error(err))
    }

    useEffect(() => {
        const handleEnter = (e) => {
            if (e.key === "Enter") handleSubmit()
        }
        document.addEventListener("keydown", handleEnter)
        return () => document.removeEventListener("keydown", handleEnter)
    }, [newKomentar, selectedData])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    if (!detailShow || !selectedData) return null

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
                                                        <a href={`/storage/${selectedData.dokumen_path}`} target="_blank" className="btn btn-primary btn-sm">
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
                                <div className="flex-fill d-flex flex-column" style={selectedData?.dokumen_path ? { maxWidth: "50%" } : { maxWidth: "100%" }}>
                                    <div className="p-3 border-bottom caption-section">
                                        <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                        <small className="text-muted">
                                            <strong>
                                                {selectedData.rukun_tetangga ? selectedData.rukun_tetangga.nama : selectedData.rw.nama_ketua_rw}
                                            </strong> • {" "}
                                            {selectedData.rukun_tetangga
                                                ? `${selectedData.rukun_tetangga.jabatan.nama_jabatan.charAt(0).toUpperCase()}${selectedData.rukun_tetangga.jabatan.nama_jabatan.slice(1)} RT`
                                                : `${selectedData.rw.jabatan.nama_jabatan.charAt(0).toUpperCase()}${selectedData.rw.jabatan.nama_jabatan.slice(1)} RW`} •
                                            RT {selectedData.rukun_tetangga?.rt}/{""}
                                            RW {selectedData.rw?.nomor_rw}{" "}
                                            {/* • {new Date(selectedData.created_at).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })} */}
                                            • <FormatWaktu createdAt={selectedData.created_at} />
                                        </small >
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
                                    </div >
                                    <div className="flex-grow-1 overflow-auto p-3 komen-section" ref={komenRef}>
                                        {komentar.length > 0 ? (
                                            komentar.map((komen, i) => (
                                                <div key={i} className="mb-3">{console.log(komen)}
                                                    <small className="fw-bold"><strong>{komen.user?.nama}</strong></small>{" "}
                                                    <small className="text-muted">
                                                        • <FormatWaktu createdAt={komen.created_at} />
                                                    </small>

                                                    <p
                                                        className={`mb-2 komen ${commentExpanded[komen.id]
                                                            ? "line-clamp-none"
                                                            : "line-clamp-3"
                                                            }`}
                                                    >
                                                        {komen.isi_komentar}
                                                    </p>

                                                    {komen.isi_komentar.length > 100 && (
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
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control komen"
                                                placeholder="Tambah komentar..."
                                                value={newKomentar}
                                                onChange={(e) => setNewKomentar(e.target.value)}
                                            />
                                            <button className="btn btn-primary my-0" type="button" onClick={handleSubmit}>
                                                <i className="far fa-paper-plane"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div >
                            </div >
                        </div >
                    </div >
                </div >
            </div >
        </>
    )
}

export function DetailPengaduan({ selectedData, detailShow, onClose, onUpdated, onDeleted, userData }) {
    const [komentar, setKomentar] = useState([])
    const [newKomentar, setNewKomentar] = useState("")
    const [captionExpanded, setCaptionExpanded] = useState(false)
    const [commentExpanded, setCommentExpanded] = useState({})
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [isEdit, setIsEdit] = useState(false)
    const textRef = useRef(null)
    const komenRef = useRef(null)

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
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [isEdit, onClose])

    const handleSubmit = () => {
        if (!newKomentar.trim()) return
        // nanti rutenya bakal diganti sesuai role
        axios.post(`/warga/pengaduan/${selectedData.id}/komentar`, {
            isi_komentar: newKomentar
        })
            .then(res => {
                setKomentar(prev => [res.data, ...prev])
                setNewKomentar("")
                if (komenRef.current) {
                    komenRef.current.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    })
                }
            })
            .catch(err => console.error(err))
    }

    useEffect(() => {
        const handleEnter = (e) => {
            if (e.key === "Enter") handleSubmit()
        }
        document.addEventListener("keydown", handleEnter)
        return () => document.removeEventListener("keydown", handleEnter)
    }, [newKomentar, selectedData])

    if (!detailShow || !selectedData) return null

    const fileName = selectedData.file_name?.toLowerCase() || ""

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
                                                            src={`/storage/${selectedData.file_path}`}
                                                            controls
                                                            autoPlay
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
                                            {userData.nik === selectedData.nik_warga ? (
                                                <div className="d-flex justify-between">
                                                    <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                                    <button onClick={toggleEdit} title="Edit Pengaduan">
                                                        <i className="far fa-edit"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                            )}
                                            <small className="text-muted">
                                                <strong>
                                                    {selectedData.warga?.nama}
                                                </strong>{" "}
                                                • RT {selectedData.warga?.kartu_keluarga?.rukun_tetangga?.rt}/RW{" "}
                                                {selectedData.warga?.kartu_keluarga?.rw?.nomor_rw}{" "}
                                                {/* • {new Date(selectedData.created_at).toLocaleDateString("id-ID", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })} */}
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

                                                        <p
                                                            className={`mb-2 komen ${commentExpanded[komen.id]
                                                                ? "line-clamp-none"
                                                                : "line-clamp-3"
                                                                }`}
                                                        >
                                                            {komen.isi_komentar}
                                                        </p>

                                                        {komen.isi_komentar.length > 100 && (
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
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control komen"
                                                    placeholder="Tambah komentar..."
                                                    value={newKomentar}
                                                    onChange={(e) => setNewKomentar(e.target.value)}
                                                />
                                                <button className="btn btn-primary my-0" type="button" onClick={handleSubmit}>
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

export function EditPengaduan({ toggle, onUpdated, onDeleted, pengaduan }) {
    const { data, setData, put, processing, errors } = useForm({
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
                                accept="image/,video/,.pdf,.doc,.docx"
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
                    fileInputRef.current.value = "" // Clear file input
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
                                                    accept="image/,video/,.pdf,.doc,.docx"
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