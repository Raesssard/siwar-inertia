import React, { useEffect, useRef, useState } from "react"
import { Link, useForm, usePage, router } from "@inertiajs/react"
import logo from '../../../../public/img/logo.png'
import { FormatWaktu } from "../Pengaduan"
import { SidebarLink } from "./SidebarLink"
import { formatTanggal, getAdminLinks, getRtLinks, getWargaLinks, getRwLinks, formatRupiah, useIsMobile } from "./GetPropRole"
import Role from "./Role"
import { route } from "ziggy-js"
import { motion } from "framer-motion"
import Select from "react-select"
import CreatableSelect from "react-select/creatable"

export function ModalSidebar({ modalIsOpen, modalShow, localStorageHistory }) {
    const [openMenus, setOpenMenus] = useState(() => {
        const saved = localStorage.getItem("openMenus");
        return saved ? JSON.parse(saved) : {};
    })
    // const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const mobile = useIsMobile();

    // useEffect(() => {
    //     function handleResize() {
    //         // setIsMobile(window.innerWidth < 768)
    //         setMobile(useIsMobile);
    //     }

    //     window.addEventListener('resize', handleResize)
    //     return () => window.removeEventListener('resize', handleResize)
    // }, [])

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => {
            const updated = { ...prev, [menuName]: !prev[menuName] };
            localStorage.setItem("openMenus", JSON.stringify(updated));
            return updated;
        })
    }

    useEffect(() => {
        localStorage.setItem("openMenus", JSON.stringify(openMenus));
    }, [openMenus]);

    useEffect(() => {
        if (localStorageHistory) {
            localStorage.removeItem("openMenus");
            setOpenMenus({});
        }
    }, [localStorageHistory]);

    const { props } = usePage()
    const role = props.auth?.currentRole

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
                        className={`modal-dialog modal-dialog-slideout-left modal-sm animasi-modal ${modalIsOpen ? "show" : ""} my-0`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content bg-primary text-white">
                            <div className="modal-header border-0">
                                <img src={logo} alt="Logo" className="sidebar-brand-icon-logo" />
                                <button className="close text-white" onClick={() => modalShow(false)}>
                                    ×
                                </button>
                            </div>
                            <div className="modal-body p-0 m-0 d-block">
                                <ul className="navbar-nav sidebar sidebar-dark accordion">
                                    <hr className="sidebar-divider my-0" />
                                    {statLinks.map((link, index) => (
                                        <SidebarLink
                                            key={index}
                                            {...link}
                                            isOpen={!!openMenus[link.text]}
                                            onToggle={() => toggleMenu(link.text)}
                                            isToggleOrMobile={mobile}
                                        />
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

// dah gk kepake lagi, kan ada di settings
// export function PasswordModal({ show }) {
//     return (
//         <>
//             <div
//                 className="modal fade show"
//                 style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
//                 tabIndex="-1"
//             >
//                 <div className="modal-dialog modal-dialog-centered">
//                     <div className="modal-content">
//                         <form onSubmit={() => show(false)}>
//                             <div className="modal-header">
//                                 <h5 className="modal-title">
//                                     <i className="fas fa-key text-primary me-1"></i>{" "}
//                                     Ubah Password
//                                 </h5>
//                                 <button
//                                     type="button"
//                                     className="btn-close"
//                                     onClick={() => show(false)}
//                                 />
//                             </div>
//                             <div className="modal-body">
//                                 <div className="form-floating mb-3 position-relative">
//                                     <input
//                                         type="password"
//                                         name="current_password"
//                                         className="form-control"
//                                         id="current_password"
//                                         placeholder="Password Lama"
//                                         required
//                                     />
//                                     <label htmlFor="current_password">
//                                         <i className="fas fa-lock me-2"></i>
//                                         Password Lama
//                                     </label>
//                                 </div>
//                                 <div className="form-floating mb-3 position-relative">
//                                     <input
//                                         type="password"
//                                         name="password"
//                                         className="form-control"
//                                         id="password"
//                                         placeholder="Password Baru"
//                                         required
//                                         minLength="6"
//                                     />
//                                     <label htmlFor="password">
//                                         <i className="fas fa-lock me-2"></i>
//                                         Password Baru
//                                     </label>
//                                 </div>
//                                 <div className="form-floating mb-3 position-relative">
//                                     <input
//                                         type="password"
//                                         name="password_confirmation"
//                                         className="form-control"
//                                         id="password_confirmation"
//                                         placeholder="Konfirmasi Password Baru"
//                                         required
//                                     />
//                                     <label htmlFor="password_confirmation">
//                                         <i className="fas fa-lock me-2"></i>
//                                         Konfirmasi Password
//                                     </label>
//                                 </div>
//                             </div>
//                             <div className="modal-footer">
//                                 <button
//                                     type="button"
//                                     className="btn btn-secondary"
//                                     onClick={() => show(false)}
//                                 >
//                                     Batal
//                                 </button>
//                                 <button type="submit" className="btn btn-primary">
//                                     Simpan Perubahan
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }

export function AddRwModal({ dataWarga, form, handleChange, handleSelectChange, handleAdd, onClose, roles = [] }) {
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
                            <Select
                                name="nik"
                                options={dataWarga?.map((item) => ({
                                    value: item.nik,
                                    label: item.nik,
                                }))}
                                value={
                                    form.nik
                                        ? {
                                            value: form.nik,
                                            label: dataWarga?.find((x) => x.nik == form.nik)?.nik || "",
                                        }
                                        : null
                                }
                                onChange={(val) => handleSelectChange("nik", val)}
                                placeholder="Pilih/Ketik NIK Warga..."
                                isSearchable={true}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Tidak ada NIK"}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        height: '2.6rem',
                                        borderColor: 'lightgray',
                                    }),
                                }}
                            />
                            {/* <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2" /> */}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nomor RW</label>
                            <input type="text" name="nomor_rw" value={form.nomor_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Anggota RW</label>
                            <input type="text" name="nama_anggota_rw" value={form.nama_anggota_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>

                        {/* 🔹 Tambahan Jabatan */}
                        <div>
                            <label className="block text-sm font-medium">Jabatan</label>
                            <select
                                name="jabatan"
                                value={form.jabatan || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="">Pilih Jabatan</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role === "ketua"
                                            ? "Ketua RW"
                                            : role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
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

export function EditRwModal({ dataWarga, form, handleChange, handleEdit, onClose, roles = [] }) {
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
                            <input type="text" name="nik" value={form.nik || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nomor RW</label>
                            <input type="text" name="nomor_rw" value={form.nomor_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Anggota RW</label>
                            <input type="text" name="nama_anggota_rw" value={form.nama_anggota_rw || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Mulai Menjabat</label>
                            <input type="date" name="mulai_menjabat" value={form.mulai_menjabat || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Akhir Jabatan</label>
                            <input type="date" name="akhir_jabatan" value={form.akhir_jabatan || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
                        </div>

                        {/* 🔹 Tambahan Jabatan */}
                        <div>
                            <label className="block text-sm font-medium">Jabatan</label>
                            <select
                                name="jabatan"
                                value={form.jabatan || ""}
                                onChange={handleChange}
                                className="w-full border rounded-md p-2"
                            >
                                <option value="">Pilih Jabatan</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role === "ketua"
                                            ? "Ketua RW"
                                            : role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
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

export function AddRtModal({ form, handleChange, handleAdd, onClose, rwList = [], isRw = false, roles = [] }) {
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

                        {/* 🔹 Nama Anggota RT */}
                        <div>
                            <label className="block text-sm font-medium">Nama Anggota RT</label>
                            <input
                                type="text"
                                name="nama_anggota_rt"
                                value={form.nama_anggota_rt || ""}
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
                                <option value="">Pilih Jabatan</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role === "ketua"
                                            ? "Ketua RT"
                                            : role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
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
                                            RW {rw.nomor_rw} - {rw.nama_anggota_rw}
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

export function EditRtModal({ form, handleChange, handleEdit, onClose, rwList = [], isRw = false, roles = [] }) {
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
                            <label className="block text-sm font-medium">Nama Anggota RT</label>
                            <input type="text" name="nama_anggota_rt" value={form.nama_anggota_rt || ""} onChange={handleChange} className="w-full border rounded-md p-2" />
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
                                <option value="">Pilih Jabatan</option>
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role === "ketua"
                                            ? "Ketua RT"
                                            : role.charAt(0).toUpperCase() + role.slice(1)}
                                    </option>
                                ))}
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
                                            RW {rw.nomor_rw} - {rw.nama_anggota_rw}
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
    const [isConfirm, setIsConfirm] = useState(false)
    const [previewBukti, setPreviewBukti] = useState(null)
    const textRef = useRef(null)
    const komenRef = useRef(null)
    const videoRef = useRef(null)
    const komenVideoRef = useRef(null)
    const previewVideoRef = useRef(null)
    const fileInputRef = useRef(null)
    // const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const isMobile = useIsMobile();

    // useEffect(() => {
    //     function handleResize() {
    //         // setIsMobile(window.innerWidth < 768);
    //         setMobile(useIsMobile);
    //     }

    //     window.addEventListener('resize', handleResize);
    //     return () => window.removeEventListener('resize', handleResize);
    // }, []);

    const handleClear = () => {
        setData("file", null)
        setPreviewBukti(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        videoRef.current.play()
    }

    useEffect(() => {
        if (role === 'rt') setIsConfirm(selectedData?.konfirmasi_rw === 'menunggu' || selectedData?.konfirmasi_rw === 'sudah')
        if (role === 'rw') setIsConfirm(selectedData?.konfirmasi_rw === 'sudah')
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
        const komen = role === "rw" ? "" : "Sudah diteruskan ke RW untuk ditindaklanjuti"
        axios.put(`/${role}/pengaduan/${selectedData.id}/konfirmasi`, {
            konfirmasi_rw: 'menunggu',
            ...(role === "rt" ? { isi_komentar: komen } : {})
        })
            .then(res => {
                const newKomentar = res.data.komentar;
                const updatedPengaduan = res.data.pengaduan;
                setKomentar(prev => [newKomentar, ...prev])
                setIsConfirm(true)
                if (onUpdated) onUpdated(updatedPengaduan)
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
    const filePath = selectedData?.file_path?.toLowerCase() || ""

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
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onClick={() => {
                    onClose()
                    setIsEdit(false)
                    setIsConfirm(selectedData?.konfirmasi_rw === 'menunggu' || selectedData?.konfirmasi_rw === 'sudah')
                }}
            >
                <div
                    className={`modal-dialog modal-komen modal-lg modal-dialog-scrollable modal-dialog-centered ${isMobile ? 'mobile' : 'desktop'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`modal-content modal-komen shadow-lg border-0 ${isMobile ? 'mobile' : 'desktop'}`}>
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
                                        setIsEdit(false)
                                    }}
                                />
                            ) : (
                                <div className={`d-flex modal-komen ${isMobile ? 'flex-col mobile' : 'flex-row desktop'}`}>
                                    {selectedData?.file_path ? (
                                        <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center"
                                            style={
                                                isMobile
                                                    ? {
                                                        width: "100%",
                                                        height: "50vh", // jadi 50% tinggi modal/layar
                                                        order: -1, // pindah ke atas
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }
                                                    : {
                                                        maxWidth: "50%",
                                                        height: "100%",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }
                                            }>
                                            {isMobile && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            setPreview({
                                                                show: true,
                                                                type: fileName.endsWith(".pdf")
                                                                    ? "pdf"
                                                                    : fileName.match(/\.(mp4|webm|avi)$/)
                                                                        ? "video"
                                                                        : "image",
                                                                src: getFileUrl(filePath),
                                                            })
                                                        }
                                                        style={{
                                                            position: "absolute",
                                                            top: "5px",
                                                            left: "5px",
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
                                                        title="Expand"
                                                    >
                                                        <i className="fa-solid fa-expand"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onClose()
                                                            setIsEdit(false)
                                                        }}
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
                                                        title="Tutup"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            )}
                                            {selectedData.file_path ? (
                                                <>
                                                    {fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif") ? (
                                                        <img
                                                            src={`/storage/${selectedData.file_path}`}
                                                            alt={selectedData.file_name}
                                                            className="img-fluid"
                                                            style={{
                                                                maxHeight: isMobile ? "100%" : "80vh",
                                                                maxWidth: "100%",
                                                                objectFit: "contain",
                                                            }}
                                                        />
                                                    ) : fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi") ? (
                                                        <video
                                                            ref={videoRef}
                                                            src={`/storage/${selectedData.file_path}`}
                                                            controls
                                                            autoPlay={!previewBukti}
                                                            loop
                                                            className="w-100"
                                                            style={{
                                                                maxHeight: isMobile ? "100%" : "80vh",
                                                                maxWidth: "100%",
                                                                objectFit: "contain",
                                                            }}
                                                        />
                                                    ) : fileName.endsWith(".pdf") ? (
                                                        <embed
                                                            src={`/storage/${selectedData.file_path}`}
                                                            type="application/pdf"
                                                            className="pdf-preview"
                                                            style={{
                                                                width: "100%",
                                                                height: isMobile ? "100%" : "80vh",
                                                            }}
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
                                    <div className="flex-fill d-flex flex-column"
                                        style={isMobile
                                            ? {
                                                width: "100%",
                                                display: "flex",
                                            }
                                            : selectedData?.file_path
                                                ? { maxWidth: "50%" }
                                                : { maxWidth: "100%" }}
                                    >
                                        <div className="p-3 border-bottom caption-section" style={{ width: '100%' }}>
                                            {(isMobile && !selectedData?.file_path) && (
                                                <div className="d-flex justify-content-end w-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => onClose()}
                                                        title="Tutup"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                            {(userData.nik === selectedData.nik_warga && role === 'warga') ? (
                                                <div className="d-flex justify-between">
                                                    <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                                    <button onClick={toggleEdit} title="Edit Pengaduan">
                                                        <i className="far fa-edit"></i>
                                                    </button>
                                                </div>
                                            ) : (role.includes('rt') || role.includes('rw')) ? (
                                                <div className="d-flex justify-between">
                                                    <h5 className="fw-bold mb-1 mt-2">{selectedData.judul}</h5>
                                                    <Role role={selectedData.level === 'rt' ? ["rt", "sekretaris"] : ["rw", "sekretaris"]}>
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
                                                        <small className="fw-bold"><strong>{komen?.user?.nama}</strong></small>{" "}
                                                        <small className="fw-bold text-muted">
                                                            • {komen?.role_snapshot?.length <= 2
                                                                ? `${komen?.role_snapshot?.toUpperCase() ?? '(role tidak ada)'}`
                                                                : `${komen?.role_snapshot?.replace(/\b\w/g, (char) => char.toUpperCase()) ?? '(role tidak ada)'}`
                                                            }
                                                        </small>{" "}
                                                        <small className="text-muted">
                                                            • <FormatWaktu createdAt={komen?.created_at} />
                                                        </small>
                                                        {(komen?.file_path && komen?.file_name) && (
                                                            <div
                                                                className="flex-fill border-end bg-black d-flex align-items-center justify-content-center mb-2 mt-2"
                                                                style={{
                                                                    width: "200px",
                                                                    height: "200px",
                                                                    overflow: "hidden",
                                                                    borderRadius: "10px",
                                                                    position: "relative",
                                                                }}>
                                                                <button
                                                                    onClick={() =>
                                                                        setPreview({
                                                                            show: true,
                                                                            type: komen?.file_name.endsWith(".pdf")
                                                                                ? "pdf"
                                                                                : komen?.file_name.match(/\.(mp4|webm|avi)$/)
                                                                                    ? "video"
                                                                                    : "image",
                                                                            src: getFileUrl(komen?.file_path),
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
                                                                    title="Lihat Lampiran"
                                                                >
                                                                    <i className="fa-solid fa-expand"></i>
                                                                </button>
                                                                {komen?.file_name.endsWith(".jpg") || komen?.file_name.endsWith(".jpeg") || komen?.file_name.endsWith(".png") || komen?.file_name.endsWith(".gif") ? (
                                                                    <img
                                                                        src={getFileUrl(komen?.file_path)}
                                                                        alt="Preview"
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain"
                                                                        }}
                                                                    />
                                                                ) : komen?.file_name.endsWith(".mp4") || komen?.file_name.endsWith(".webm") || komen?.file_name.endsWith(".avi") ? (
                                                                    <video
                                                                        ref={komenVideoRef}
                                                                        src={getFileUrl(komen?.file_path)}
                                                                        controls
                                                                        loop
                                                                        style={{
                                                                            maxWidth: "100%",
                                                                            maxHeight: "100%",
                                                                            objectFit: "contain",
                                                                            backgroundColor: "black"
                                                                        }}
                                                                    />
                                                                ) : komen?.file_name.endsWith(".pdf") ? (
                                                                    <embed
                                                                        src={getFileUrl(komen?.file_path)}
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
                                                                        File dipilih: {komen?.file_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p
                                                            className={`mb-2 komen ${commentExpanded[komen?.id]
                                                                ? "line-clamp-none"
                                                                : "line-clamp-3"
                                                                }`}
                                                        >
                                                            {komen?.isi_komentar}
                                                        </p>

                                                        {komen?.isi_komentar?.length > 100 && (
                                                            <button
                                                                className="btn-expand btn btn-link p-0 text-decoration-none mt-0"
                                                                onClick={() => toggleExpand(komen?.id)}
                                                            >
                                                                {commentExpanded[komen?.id]
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
                                                    <button
                                                        onClick={() => setPreview({ show: false, src: "", type: "" })}
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
                                                        title="Tutup"
                                                    >
                                                        ✕
                                                    </button>
                                                    {preview.type === "image" ? (
                                                        <img
                                                            src={preview.src}
                                                            alt="Preview"
                                                            style={isMobile ? {
                                                                maxWidth: "90%",
                                                                maxHeight: "80%",
                                                                objectFit: "contain",
                                                                borderRadius: "10px",
                                                            } : {
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
                                                            style={isMobile ? {
                                                                maxWidth: "90%",
                                                                maxHeight: "80%",
                                                                borderRadius: "10px",
                                                                backgroundColor: "black",
                                                            } : {
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
                                                            style={isMobile ? {
                                                                width: "90%",
                                                                height: "80%",
                                                                borderRadius: "10px",
                                                                backgroundColor: "white",
                                                            } : {
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
                                        <div className="komen p-3 border-top" style={
                                            isMobile
                                                ? {
                                                    position: 'sticky',
                                                    bottom: '0',
                                                    backgroundColor: 'white',
                                                } : {}
                                        }>
                                            {((role.includes('rt') || role.includes('rw')) && !isConfirm && selectedData.level === 'rt') ? (
                                                <button className="btn btn-primary w-100" type="button" onClick={handleConfirm}>
                                                    <i className="fas fa-check me-2"></i>
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
                                                        <Role role={['rt', 'rw', 'sekretaris', 'admin']}>
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
    const [preview, setPreview] = useState({
        show: false,
        type: "",
        src: "",
    })
    const [previewUrl, setPreviewUrl] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const fileName = previewUrl?.src?.split('/').pop().toLowerCase() || ""
    const filePath = previewUrl?.src?.toLowerCase() || ""
    const isMobile = useIsMobile()
    const deletePengaduan = () => {
        setShowAlert(true)
    }

    const confirmDelete = (e) => {
        e.preventDefault()
        setShowAlert(false)

        axios.delete(`/warga/pengaduan/${pengaduan.id}`)
            .then(res => {
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
        <div className={`d-flex modal-komen ${isMobile ? 'flex-col mobile' : 'flex-row desktop'}`}>
            {previewUrl ? (
                <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center"
                    style={
                        isMobile
                            ? {
                                width: "100%",
                                height: "50vh", // jadi 50% tinggi modal/layar
                                order: -1, // pindah ke atas
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }
                            : {
                                maxWidth: "50%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }
                    }
                >
                    {isMobile && (
                        <>
                            <button
                                onClick={() =>
                                    setPreview({
                                        show: true,
                                        type: fileName.endsWith(".pdf")
                                            ? "pdf"
                                            : fileName.match(/\.(mp4|webm|avi)$/)
                                                ? "video"
                                                : "image",
                                        src: getFileUrl(filePath),
                                    })
                                }
                                style={{
                                    position: "absolute",
                                    top: "5px",
                                    left: "5px",
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
                                title="Expand"
                            >
                                <i className="fa-solid fa-expand"></i>
                            </button>
                            <button
                                onClick={() => toggle()}
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
                                title="Kembali"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                        </>
                    )}
                    <div id="preview">
                        {previewUrl && previewUrl.type === "image" && (
                            <img
                                src={getFileUrl(previewUrl.src)}
                                alt="Preview"
                                style={{
                                    maxHeight: isMobile ? "100%" : "80vh",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                        {previewUrl && previewUrl.type === "video" && (
                            <video
                                src={getFileUrl(previewUrl.src)}
                                controls
                                autoPlay
                                loop
                                style={{
                                    maxHeight: isMobile ? "100%" : "80vh",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                        {previewUrl && previewUrl.type === "pdf" && (
                            <embed
                                src={getFileUrl(previewUrl.src)}
                                type="application/pdf"
                                className="pdf-preview"
                                style={{
                                    width: "100%",
                                    height: isMobile ? "100%" : "80vh",
                                }}

                            />
                        )}
                        {previewUrl && previewUrl.type === "other" && <p>File dipilih: {previewUrl.name}</p>}
                    </div>
                </div>
            ) : (
                ""
            )}
            <div className="flex-fill d-flex flex-column" style={isMobile
                ? {
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }
                : previewUrl
                    ? { maxWidth: "50%" }
                    : { maxWidth: "100%" }}
            >
                <div className="p-3" style={{ height: "100%", width: '100%' }}>
                    {(!isMobile || !previewUrl) && (
                        <div className="d-flex justify-content-end w-100">
                            <button
                                type="button"
                                onClick={() => toggle()}
                                title="Kembali"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-2">
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

                        <div className="mb-2">
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

                        <div className="mb-2">
                            <label className="form-label">Tujuan Pengaduan: </label>
                            <select
                                name="level"
                                className="edit-tujuan form-control"
                                value={data.level}
                                onChange={(e) => setData("level", e.target.value)}
                                style={{
                                    border: '0',
                                    borderBottom: '1px solid lightgray',
                                    borderRadius: '0',
                                }}
                            >
                                <option value="rt">RT</option>
                                <option value="rw">RW</option>
                            </select>
                        </div>

                        <div className="mb-2">
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
                                <i className="fas fa-upload me-2"></i>
                                <small>
                                    Upload File
                                </small>
                            </button>
                            {pengaduan?.file_name && !data.file && (
                                <small
                                    className="text-muted d-block mt-2"
                                    style={{
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    File lama: {pengaduan.file_name}
                                </small>
                            )}
                            {data.file && (
                                <small
                                    className="text-success d-block mt-2"
                                    style={{
                                        wordBreak: 'break-all',
                                    }}
                                >
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
                                <i className="fas fa-trash me-2"></i>
                                Hapus
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="fas fa-save me-2"></i>
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
                            <button
                                onClick={() => setPreview({ show: false, src: "", type: "" })}
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
                                title="Tutup"
                            >
                                ✕
                            </button>
                            {preview.type === "image" ? (
                                <img
                                    src={preview.src}
                                    alt="Preview"
                                    style={isMobile ? {
                                        maxWidth: "90%",
                                        maxHeight: "80%",
                                        objectFit: "contain",
                                        borderRadius: "10px",
                                    } : {
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
                                    style={isMobile ? {
                                        maxWidth: "90%",
                                        maxHeight: "80%",
                                        borderRadius: "10px",
                                        backgroundColor: "black",
                                    } : {
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
                                    style={isMobile ? {
                                        width: "90%",
                                        height: "80%",
                                        borderRadius: "10px",
                                        backgroundColor: "white",
                                    } : {
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
    const [preview, setPreview] = useState({
        show: false,
        type: "",
        src: "",
    })
    const fileInputRef = useRef(null)
    const isMobile = useIsMobile()

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
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onClick={() => {
                    onClose()
                }}
            >
                <div
                    className={`modal-dialog modal-komen modal-lg modal-dialog-scrollable modal-dialog-centered ${isMobile ? 'mobile' : 'desktop'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`modal-content modal-komen shadow-lg border-0 ${isMobile ? 'mobile' : 'desktop'}`}>
                        <div className="modal-body p-0 m-0">
                            <div className={`d-flex modal-komen ${isMobile ? 'flex-col mobile' : 'flex-row desktop'}`}>
                                {previewUrl ? (
                                    <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center"
                                        style={
                                            isMobile
                                                ? {
                                                    width: "100%",
                                                    height: "50vh", // jadi 50% tinggi modal/layar
                                                    order: -1, // pindah ke atas
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }
                                                : {
                                                    maxWidth: "50%",
                                                    height: "100%",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }
                                        }
                                    >
                                        {isMobile && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setPreview({
                                                            show: true,
                                                            type: previewUrl?.type === ("pdf")
                                                                ? "pdf"
                                                                : previewUrl?.type === ("video")
                                                                    ? "video"
                                                                    : "image",
                                                            src: getFileUrl(previewUrl?.src),
                                                        })
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        top: "5px",
                                                        left: "5px",
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
                                                    title="Expand"
                                                >
                                                    <i className="fa-solid fa-expand"></i>
                                                </button>
                                                <button
                                                    onClick={() => onClose()}
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
                                                    title="Tutup"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        )}
                                        <div id="preview">
                                            {previewUrl && previewUrl.type === "image" && (
                                                <img
                                                    src={getFileUrl(previewUrl.src)}
                                                    alt="Preview"
                                                    style={{
                                                        maxHeight: isMobile ? "100%" : "80vh",
                                                        maxWidth: "100%",
                                                        objectFit: "contain",
                                                    }}
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "video" && (
                                                <video
                                                    src={getFileUrl(previewUrl.src)}
                                                    controls
                                                    autoPlay
                                                    loop
                                                    style={{
                                                        maxHeight: isMobile ? "100%" : "80vh",
                                                        maxWidth: "100%",
                                                        objectFit: "contain",
                                                    }}
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "pdf" && (
                                                <embed
                                                    src={getFileUrl(previewUrl.src)}
                                                    type="application/pdf"
                                                    className="pdf-preview"
                                                    style={{
                                                        width: "100%",
                                                        height: isMobile ? "100%" : "80vh",
                                                    }}

                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "other" && <p>File dipilih: {previewUrl.name}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    ""
                                )}
                                <div className="flex-fill d-flex flex-column" style={isMobile
                                    ? {
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }
                                    : previewUrl
                                        ? { maxWidth: "50%" }
                                        : { maxWidth: "100%" }}
                                >
                                    <div className="p-3" style={{ height: "100%", width: '100%' }}>
                                        {(isMobile && !previewUrl) && (<div className="d-flex justify-content-end w-100">
                                            <button
                                                type="button"
                                                onClick={() => onClose()}
                                                title="Tutup"
                                            >
                                                ✕
                                            </button>
                                        </div>)}
                                        <form onSubmit={handleSubmit}>
                                            <div className="mb-2">
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

                                            <div className="mb-2">
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

                                            <div className="mb-2">
                                                <label className="form-label">Tujuan Pengaduan: </label>
                                                <select
                                                    name="level"
                                                    className="edit-tujuan form-control"
                                                    value={data.level}
                                                    onChange={(e) => setData("level", e.target.value)}
                                                    style={{
                                                        border: '0',
                                                        borderBottom: '1px solid lightgray',
                                                        borderRadius: '0',
                                                    }}
                                                >
                                                    <option value="">...</option>
                                                    <option value="rt">RT</option>
                                                    <option value="rw">RW</option>
                                                </select>
                                            </div>

                                            <div className="mb-2">
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
                                                    <i className="fas fa-upload me-2"></i>
                                                    <small>
                                                        Upload File
                                                    </small>
                                                </button>
                                                {data.file && (
                                                    <small className="text-success d-block mt-2" style={{ wordBreak: 'break-all' }}>
                                                        File dipilih: {data.file.name}
                                                    </small>
                                                )}
                                            </div>

                                            <div className="d-flex justify-content-end" style={{ marginTop: "auto" }}>
                                                <button type="submit" className="btn btn-primary">
                                                    <i className="fas fa-save me-2"></i>
                                                    Simpan
                                                </button>
                                            </div>
                                        </form>
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
                                                <button
                                                    onClick={() => setPreview({ show: false, src: "", type: "" })}
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
                                                    title="Tutup"
                                                >
                                                    ✕
                                                </button>
                                                {preview.type === "image" ? (
                                                    <img
                                                        src={getFileUrl(preview.src)}
                                                        alt="Preview"
                                                        style={isMobile ? {
                                                            maxWidth: "90%",
                                                            maxHeight: "80%",
                                                            objectFit: "contain",
                                                            borderRadius: "10px",
                                                        } : {
                                                            maxWidth: "90%",
                                                            maxHeight: "90%",
                                                            objectFit: "contain",
                                                            borderRadius: "10px",
                                                        }}
                                                    />
                                                ) : preview.type === "video" ? (
                                                    <video
                                                        src={getFileUrl(preview.src)}
                                                        controls
                                                        autoPlay
                                                        style={isMobile ? {
                                                            maxWidth: "90%",
                                                            maxHeight: "80%",
                                                            borderRadius: "10px",
                                                            backgroundColor: "black",
                                                        } : {
                                                            maxWidth: "90%",
                                                            maxHeight: "90%",
                                                            borderRadius: "10px",
                                                            backgroundColor: "black",
                                                        }}
                                                    />
                                                ) : preview.type === "pdf" ? (
                                                    <embed
                                                        src={getFileUrl(preview.src)}
                                                        type="application/pdf"
                                                        style={isMobile ? {
                                                            width: "90%",
                                                            height: "80%",
                                                            borderRadius: "10px",
                                                            backgroundColor: "white",
                                                        } : {
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function TambahEditKK({ show, onClose, dataKK = null, kategoriIuran, daftarRT = [], role }) {
    const isEdit = !!dataKK;

    const { data, setData, post, put, processing, reset } = useForm({
        no_kk: dataKK?.no_kk ?? "",
        no_registrasi: dataKK?.no_registrasi ?? "",
        alamat: dataKK?.alamat ?? "",
        kelurahan: dataKK?.kelurahan ?? "",
        kecamatan: dataKK?.kecamatan ?? "",
        kabupaten: dataKK?.kabupaten ?? "",
        provinsi: dataKK?.provinsi ?? "",
        kode_pos: dataKK?.kode_pos ?? "",
        tgl_terbit: dataKK?.tgl_terbit ?? "",
        kategori_iuran: dataKK?.kategori_iuran ?? "",
        instansi_penerbit: dataKK?.instansi_penerbit ?? "",
        kabupaten_kota_penerbit: dataKK?.kabupaten_kota_penerbit ?? "",
        nama_kepala_dukcapil: dataKK?.nama_kepala_dukcapil ?? "",
        nip_kepala_dukcapil: dataKK?.nip_kepala_dukcapil ?? "",
        id_rt: dataKK?.id_rt ?? "",
    });

    useEffect(() => {
        if (dataKK) {
            setData({
                no_kk: dataKK.no_kk,
                no_registrasi: dataKK.no_registrasi,
                alamat: dataKK.alamat,
                kelurahan: dataKK.kelurahan,
                kecamatan: dataKK.kecamatan,
                kabupaten: dataKK.kabupaten,
                provinsi: dataKK.provinsi,
                kode_pos: dataKK.kode_pos,
                tgl_terbit: dataKK.tgl_terbit,
                kategori_iuran: dataKK.kategori_iuran,
                instansi_penerbit: dataKK.instansi_penerbit,
                kabupaten_kota_penerbit: dataKK.kabupaten_kota_penerbit,
                nama_kepala_dukcapil: dataKK.nama_kepala_dukcapil,
                nip_kepala_dukcapil: dataKK.nip_kepala_dukcapil,
                id_rt: dataKK.id_rt ?? "",
            });
        } else {
            reset();
        }
    }, [dataKK]);

    if (!show) return null;

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/${role}/kartu_keluarga/${dataKK.id}`, { preserveScroll: true });
        } else {
            post(`/${role}/kartu_keluarga`, { preserveScroll: true });
        }
    };

    return (
        <div
            className="modal fade show"
            style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1050,
            }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-xl modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: "80%", margin: "auto" }}
            >
                <div className="modal-content shadow-lg border-0 rounded-3">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title fw-semibold">
                            {isEdit ? "Edit Kartu Keluarga" : "Tambah Kartu Keluarga"}
                        </h5>
                    </div>

                    <form onSubmit={submit}>
                        <div className="modal-body px-4 py-4">
                            {/* No KK dan No Registrasi */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">No. KK</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-sm"
                                        value={data.no_kk}
                                        onChange={(e) => setData("no_kk", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">No. Registrasi</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-sm"
                                        value={data.no_registrasi}
                                        onChange={(e) => setData("no_registrasi", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Pilih RT */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">Pilih RT</label>
                                    <select
                                        className="form-select shadow-sm"
                                        value={data.id_rt}
                                        onChange={(e) => setData("id_rt", e.target.value)}
                                    >
                                        <option value="">-- Pilih RT --</option>
                                        {daftarRT.map((rt) => (
                                            <option key={rt.id} value={rt.id}>
                                                RT {rt?.nomor_rt} / RW {rt.rw?.nomor_rw}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">Kategori Iuran</label>
                                    <select
                                        className="form-select shadow-sm"
                                        value={data.kategori_iuran}
                                        onChange={(e) => setData("kategori_iuran", e.target.value)}
                                        required
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {Array.isArray(kategoriIuran)
                                            ? kategoriIuran.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.jenis}
                                                </option>
                                            ))
                                            : Object.entries(kategoriIuran).map(([id, val]) => (
                                                <option key={id} value={id}>
                                                    {val?.jenis ?? val}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="mb-3">
                                <label className="form-label fw-medium">Alamat Lengkap</label>
                                <textarea
                                    className="form-control shadow-sm"
                                    rows="2"
                                    value={data.alamat}
                                    onChange={(e) => setData("alamat", e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            {/* Lokasi */}
                            <div className="row g-3 mb-3">
                                {["kelurahan", "kecamatan", "kabupaten", "provinsi"].map((field, i) => (
                                    <div className="col-md-6" key={i}>
                                        <label className="form-label fw-medium">
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control shadow-sm"
                                            value={data[field]}
                                            onChange={(e) => setData(field, e.target.value)}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Info Tambahan */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-medium">Kode Pos</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-sm"
                                        value={data.kode_pos}
                                        onChange={(e) => setData("kode_pos", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-medium">Tanggal Terbit</label>
                                    <input
                                        type="date"
                                        className="form-control shadow-sm"
                                        value={data.tgl_terbit}
                                        onChange={(e) => setData("tgl_terbit", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-medium">Instansi Penerbit</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-sm"
                                        value={data.instansi_penerbit}
                                        onChange={(e) => setData("instansi_penerbit", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Info Dukcapil */}
                            <div className="row g-3 mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">Kabupaten/Kota Penerbit</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-sm"
                                        value={data.kabupaten_kota_penerbit}
                                        onChange={(e) => setData("kabupaten_kota_penerbit", e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">Nama Kepala Dukcapil</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-sm"
                                        value={data.nama_kepala_dukcapil}
                                        onChange={(e) => setData("nama_kepala_dukcapil", e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">NIP Kepala Dukcapil</label>
                                    <input
                                        type="text"
                                        className="form-control shadow-sm"
                                        value={data.nip_kepala_dukcapil}
                                        onChange={(e) => setData("nip_kepala_dukcapil", e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer bg-light d-flex justify-content-between">
                            <button type="button" className="btn btn-outline-secondary px-4" onClick={onClose}>
                                <i className="bi bi-x-circle"></i> Batal
                            </button>
                            <button type="submit" className="btn btn-success px-4" disabled={processing}>
                                {processing ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export function DetailKK({ selectedData, detailShow, onClose, role, userData }) {
    if (!detailShow || !selectedData) return null

    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isPdf, setIsPdf] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [viewDoc, setViewDoc] = useState(null)
    const [selected, setSelected] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [wargaToDelete, setWargaToDelete] = useState(null);


    useEffect(() => {
        function handleResize() {
            setWindowWidth(window.innerWidth)
            setWindowHeight(window.innerHeight)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const modalDetail = (item) => {
        setSelected(item)
        setShowModal(true)
    }

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

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
        if (!selectedFile) return alert("Pilih file terlebih dahulu!")

        setUploading(true)
        const formData = new FormData()
        formData.append("kk_file", selectedFile)
        formData.append("_method", "PUT")

        axios
            .post(`/rt/kartu_keluarga/${selectedData?.no_kk}/upload-foto`, formData)
            .then((res) => {
                console.log("Upload sukses:", res.data)
                alert("Dokumen berhasil diunggah!")
            })
            .catch((err) => {
                console.error("Upload gagal:", err.response?.data || err)
                alert("Gagal upload file, cek console/log Laravel.")
            })
            .finally(() => setUploading(false))
    }

    const handleDelete = () => {
        if (!window.confirm("Yakin hapus dokumen ini?")) return

        axios
            .delete(`/${role}/kartu_keluarga/${selectedData?.no_kk}/delete-foto`)
            .then(() => {
                alert("Dokumen berhasil dihapus!")
            })
            .catch((err) => {
                console.error(err)
                alert("Gagal menghapus dokumen!")
            })
    }

    const mobile = useIsMobile();

    const mobileStyle = mobile ? {
        width: '90vw',
        maxWidth: (windowWidth - (windowWidth * 0.2)) + 'px',
        maxHeight: (windowHeight - (windowHeight * 0.2)) + 'px',
        height: '80vh',         // pastikan ADA height fixed
        overflowY: 'auto',      // biar scroll
        margin: '19% auto',
    } : {};

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                onClick={onClose}
            >
                <div
                    className={`modal-dialog modal-xl modal-dialog-scrollable ${mobile ? "" : "modal-dialog-centered"}`}
                    style={mobileStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow border-0">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title text-white">Detail Kartu Keluarga</h5>
                        </div>

                        <div className="modal-body kk d-block p-4">
                            <div className="kk-header w-100">
                                <div className="kk-header-top-line">
                                    <div className="kk-header-left-space"></div>
                                    <div className="kk-header-right-reg">
                                        {selectedData?.no_registrasi && (
                                            <p>
                                                No. Registrasi:
                                                <strong>{selectedData?.no_registrasi}</strong>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="kk-header-main-title">
                                    <h4>KARTU KELUARGA</h4>
                                    <p className="no-kk-big">
                                        No. KK: <strong>{selectedData?.no_kk}</strong>
                                    </p>
                                </div>
                            </div>

                            <div className="kk-info-grid mb-2">
                                <div className="kk-info-item">
                                    <p><strong>Nama Kepala Keluarga</strong> :{" "}
                                        {selectedData?.kepala_keluarga?.nama ?? '-'}
                                    </p>
                                    <p><strong>Alamat</strong> :{" "}
                                        {selectedData?.alamat ?? '-'}
                                    </p>
                                    <p><strong>RT/RW</strong> :{" "}
                                        {selectedData?.rukun_tetangga?.nomor_rt ?? '-'}/{selectedData?.rw?.nomor_rw ?? '-'}
                                    </p>
                                    <p>
                                        <strong>Desa/Kelurahan</strong> :{" "}
                                        {selectedData?.kelurahan ?? "-"}
                                    </p>
                                </div>
                                <div className="kk-info-item">
                                    <p>
                                        <strong>Kecamatan</strong> :{" "}
                                        {selectedData?.kecamatan ?? "-"}
                                    </p>
                                    <p>
                                        <strong>Kabupaten/Kota</strong> :{" "}
                                        {selectedData?.kabupaten ?? "-"}
                                    </p>
                                    <p>
                                        <strong>Kode Pos</strong> :{" "}
                                        {selectedData?.kode_pos ?? "-"}
                                    </p>
                                    <p>
                                        <strong>Provinsi</strong> :{" "}
                                        {selectedData?.provinsi ?? "-"}
                                    </p>
                                </div>
                            </div>

                            <hr
                                className="my-2"
                                style={{ borderTop: "2px solid #e0e0e0", width: "100%" }}
                            />

                            <h6 className="fw-bold text-center mb-3 mt-2">
                                DAFTAR ANGGOTA KELUARGA
                            </h6>
                            {(role === "rw" || role === "admin") && (
                                <div className="d-flex justify-content-end mb-3">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => {
                                            const routeName = role === "admin" ? "admin.warga.create" : "rw.warga.create";
                                            router.visit(route(routeName, { no_kk: selectedData?.no_kk }));
                                        }}
                                    >
                                        <i className="bi bi-person-plus"></i> Tambah Warga
                                    </button>
                                </div>
                            )}
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
                                            <th rowSpan="2">Detail</th>
                                            <Role role="rw">
                                                <th rowSpan="2">Aksi</th>
                                            </Role>
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
                                        {selectedData?.warga &&
                                            selectedData?.warga.length > 0 ? (
                                            selectedData?.warga
                                                .sort((a, b) => {
                                                    const getRank = (hubungan) => {
                                                        if (hubungan === "Kepala Keluarga") return 2
                                                        if (hubungan === "Istri") return 1
                                                        return 0
                                                    }
                                                    return (
                                                        getRank(
                                                            b.status_hubungan_dalam_keluarga
                                                        ) -
                                                        getRank(
                                                            a.status_hubungan_dalam_keluarga
                                                        )
                                                    )
                                                })
                                                .map((data, index) => (
                                                    <tr key={index}>
                                                        <td className="text-center">{index + 1}</td>
                                                        <td className="text-center">
                                                            {data.nama ?? "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.nik ?? "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.jenis_kelamin
                                                                ? data.jenis_kelamin.charAt(0).toUpperCase() +
                                                                data.jenis_kelamin.slice(1)
                                                                : "-"}
                                                        </td>
                                                        <td>{data.tempat_lahir ?? "-"}</td>
                                                        <td className="text-center">
                                                            {formatTanggal(data.tanggal_lahir)}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.agama ?? "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.pendidikan ?? "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.pekerjaan ?? "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.golongan_darah ?? "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.status_perkawinan
                                                                ? data.status_perkawinan.charAt(0).toUpperCase() +
                                                                data.status_perkawinan.slice(1)
                                                                : "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.status_hubungan_dalam_keluarga
                                                                ? data.status_hubungan_dalam_keluarga
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                data.status_hubungan_dalam_keluarga.slice(1)
                                                                : "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.kewarganegaraan ?? "WNI"}
                                                        </td>
                                                        <td className="text-center">
                                                            {data.no_paspor ?? "-"}
                                                        </td>
                                                        <td className="text-center">
                                                            {`${data.no_kitas ?? "-"} / ${data.no_kitap ?? "-"
                                                                }`}
                                                        </td>
                                                        <td className="text-center">{data.nama_ayah ?? '-'}</td>
                                                        <td className="text-center">{data.nama_ibu ?? '-'}</td>
                                                        <td className="text-center">{data.status_warga.charAt(0).toUpperCase() + data.status_warga.slice(1) ?? '-'}</td>
                                                        <td className="text-center space-x-1">
                                                            {/* Detail */}
                                                            <button
                                                                onClick={() => modalDetail(data)}
                                                                className="inline-flex items-center justify-center rounded-md bg-green-500 hover:bg-green-600 text-white px-2 py-2 text-xs transition-all"
                                                                style={{ borderRadius: '0.25rem' }}
                                                            >
                                                                <i className="fas fa-info"></i>
                                                            </button>

                                                            {/* Role khusus RW dan Admin */}
                                                            <Role role={['rw', 'admin']}>
                                                                <>
                                                                    {/* Edit */}
                                                                    <button
                                                                        onClick={() => {
                                                                            const routeName = role === "admin" ? "admin.warga.edit" : "rw.warga.edit";
                                                                            router.visit(route(routeName, data.id));
                                                                        }}
                                                                        className="inline-flex items-center justify-center rounded-md bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 text-xs transition-all"
                                                                    >
                                                                        <i className="bi bi-pencil-square"></i>
                                                                    </button>

                                                                    {/* Hapus */}
                                                                    <button
                                                                        onClick={() => {
                                                                            setWargaToDelete(data);
                                                                            setShowDeleteModal(true);
                                                                        }}
                                                                        className="inline-flex items-center justify-center rounded-md bg-red-500 hover:bg-red-600 text-white px-2 py-2 text-xs transition-all"
                                                                        style={{ borderRadius: '0.25rem' }}
                                                                    >
                                                                        <i className="bi bi-trash"></i>
                                                                    </button>
                                                                </>
                                                            </Role>
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="19"
                                                    className="text-center text-muted p-4"
                                                >
                                                    Tidak ada anggota keluarga yang terdaftar untuk
                                                    Kartu Keluarga ini.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="kk-document-section mt-1">
                                <h6 className="fw-bold mb-3">
                                    Unggah / Perbarui Dokumen KK
                                </h6>

                                <form
                                    onSubmit={handleUpload}
                                    className="input-group mb-2 d-flex"
                                >
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
                                        style={{ borderRadius: "0 0.35rem 0.35rem 0" }}
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
                                                    boxShadow:
                                                        "0 0 5px rgba(0,0,0,0.2)",
                                                }}
                                            />
                                        )}
                                    </div>
                                )}

                                {selectedData?.foto_kk && (
                                    <div className="mt-4">
                                        <h6>Dokumen Saat Ini:</h6>
                                        <div className="d-flex align-items-center gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={() =>
                                                    setViewDoc(
                                                        `/storage/${selectedData?.foto_kk}`
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

                        <div className="modal-footer bg-light mt-0">
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
            <DetailWarga
                selectData={selected}
                detailShow={showModal}
                onClose={() => setShowModal(false)}
            />
            <ModalDeleteWarga
                show={showDeleteModal}
                warga={wargaToDelete}
                onClose={() => setShowDeleteModal(false)}
                onSubmit={(keterangan) => {
                    const routeName = role === "admin" ? "admin.warga.destroy" : "rw.warga.destroy";

                    router.delete(route(routeName, wargaToDelete.id), {
                        data: { keterangan },
                        onSuccess: () => {
                            alert("Warga berhasil dihapus dan history tersimpan");
                            setShowDeleteModal(false);
                        },
                        onError: () => {
                            alert("Gagal menghapus warga");
                        },
                    });
                }}
            />
        </>
    )
}

export default function ModalDeleteWarga({ show, onClose, onSubmit, warga }) {
    const [alasan, setAlasan] = useState("");
    const [keteranganManual, setKeteranganManual] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!show) {
            // Reset saat modal ditutup
            setAlasan("");
            setKeteranganManual("");
            setError("");
        }
    }, [show]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (alasan === "") {
            setError("Silakan pilih alasan");
            return;
        }

        let finalKeterangan =
            alasan === "lainnya" ? keteranganManual.trim() : alasan;

        if (alasan === "lainnya" && finalKeterangan === "") {
            setError("Silakan isi keterangan manual");
            return;
        }

        onSubmit(finalKeterangan); // kirim ke parent
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" style={{ zIndex: 99999 }}>
            <div className="bg-white rounded-xl w-full max-w-lg shadow-lg" style={{ zIndex: 100000 }}>
                <form onSubmit={handleSubmit}>
                    <div className="p-4 border-b bg-red-600 text-white rounded-t-xl">
                        <h2 className="text-lg font-bold">
                            Hapus Warga – {warga?.nama?.toUpperCase()}
                        </h2>
                    </div>

                    <div className="p-4 space-y-3">
                        <p>
                            Apakah Anda yakin ingin menghapus warga{" "}
                            <strong>{warga?.nama?.toUpperCase()}</strong> dengan
                            NIK <strong>{warga?.nik}</strong>?
                        </p>

                        <div>
                            <label className="font-medium">
                                Pilih Alasan
                            </label>
                            <select
                                className="mt-1 w-full border rounded p-2"
                                value={alasan}
                                onChange={(e) => {
                                    setAlasan(e.target.value);
                                    setError("");
                                }}
                            >
                                <option value="">-- Pilih Alasan --</option>
                                <option value="Keluar dari kampung/desa">
                                    Keluar dari kampung/desa
                                </option>
                                <option value="Meninggal dunia">
                                    Meninggal dunia
                                </option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </div>

                        {alasan === "lainnya" && (
                            <div>
                                <label className="font-medium">
                                    Keterangan Manual
                                </label>
                                <textarea
                                    className="mt-1 w-full border rounded p-2"
                                    rows="3"
                                    value={keteranganManual}
                                    onChange={(e) =>
                                        setKeteranganManual(e.target.value)
                                    }
                                ></textarea>
                            </div>
                        )}

                        {error && (
                            <p className="text-red-600 text-sm">{error}</p>
                        )}
                    </div>

                    <div className="p-4 flex justify-end gap-2 border-t">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-300 rounded"
                            onClick={onClose}
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded"
                        >
                            Hapus & Simpan History
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export function DetailPengumuman({ kategori, selectedData, detailShow, onClose, onUpdated, onDeleted, userData, role }) {
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
    const isMobile = useIsMobile()

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
    const filePath = selectedData.dokumen_path?.toLowerCase() || ""

    const date = new Date(selectedData.tanggal?.replace(" ", "T"))

    const tanggalFormatted = date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    const waktuFormatted = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    })

    const hariFormatted = date.toLocaleDateString("id-ID", { weekday: "long" })

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onClick={() => {
                    onClose()
                    setIsEdit(false)
                }}
            >
                <div
                    className={`modal-dialog modal-komen modal-lg modal-dialog-scrollable modal-dialog-centered ${isMobile ? 'mobile' : 'desktop'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`modal-content modal-komen shadow-lg border-0 ${isMobile ? 'mobile' : 'desktop'}`}>
                        <div className="modal-body p-0 m-0">
                            {isEdit ? (
                                <EditPengumuman
                                    editKategori={kategori}
                                    toggle={toggleEdit}
                                    pengumuman={selectedData}
                                    onUpdated={(updatedPengumuman) => {
                                        onUpdated(updatedPengumuman)
                                        setIsEdit(false)
                                    }}
                                    onDeleted={(id) => {
                                        if (onDeleted) onDeleted(id)
                                        setIsEdit(false)
                                    }}
                                    role={role}
                                />
                            ) : (
                                <div className={`d-flex modal-komen ${isMobile ? 'flex-col mobile' : 'flex-row desktop'}`}>
                                    {selectedData?.dokumen_path ? (
                                        <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center"
                                            style={
                                                isMobile
                                                    ? {
                                                        width: "100%",
                                                        height: "50vh", // jadi 50% tinggi modal/layar
                                                        order: -1, // pindah ke atas
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }
                                                    : {
                                                        maxWidth: "50%",
                                                        height: "100%",
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }
                                            }>
                                            {isMobile && (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            setPreview({
                                                                show: true,
                                                                type: fileName.endsWith(".pdf")
                                                                    ? "pdf"
                                                                    : fileName.match(/\.(mp4|webm|avi)$/)
                                                                        ? "video"
                                                                        : "image",
                                                                src: getFileUrl(filePath),
                                                            })
                                                        }
                                                        style={{
                                                            position: "absolute",
                                                            top: "5px",
                                                            left: "5px",
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
                                                        title="Expand"
                                                    >
                                                        <i className="fa-solid fa-expand"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onClose()
                                                            setIsEdit(false)
                                                        }}
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
                                                        title="Tutup"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            )}
                                            {selectedData.dokumen_path ? (
                                                <>
                                                    {fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif") ? (
                                                        <img
                                                            src={`/storage/${selectedData.dokumen_path}`}
                                                            alt={selectedData.dokumen_name}
                                                            className="img-fluid"
                                                            style={{
                                                                maxHeight: isMobile ? "100%" : "80vh",
                                                                maxWidth: "100%",
                                                                objectFit: "contain",
                                                            }}
                                                        />
                                                    ) : fileName.endsWith(".mp4") || fileName.endsWith(".webm") || fileName.endsWith(".avi") ? (
                                                        <video
                                                            ref={videoRef}
                                                            src={`/storage/${selectedData.dokumen_path}`}
                                                            controls
                                                            autoPlay
                                                            loop
                                                            style={{
                                                                maxHeight: isMobile ? "100%" : "80vh",
                                                                maxWidth: "100%",
                                                                objectFit: "contain",
                                                            }}
                                                        />
                                                    ) : fileName.endsWith(".pdf") ? (
                                                        <embed
                                                            src={`/storage/${selectedData.dokumen_path}`}
                                                            type="application/pdf"
                                                            className="pdf-preview"
                                                            style={{
                                                                width: "100%",
                                                                height: isMobile ? "100%" : "80vh",
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="p-3 text-center text-white">
                                                            <i className="bi bi-file-earmark-text fs-1"></i>
                                                            <p className="mb-1">Dokumen Terlampir: {selectedData.dokumen_name}</p>
                                                            <Link preserveScroll preserveState preserveUrl href={`/storage/${selectedData.dokumen_path}`} target="_blank" className="btn btn-primary btn-sm">
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
                                    <div className="flex-fill d-flex flex-column" style={
                                        isMobile
                                            ? {
                                                width: "100%",
                                                display: "flex",
                                            }
                                            : selectedData?.dokumen_path
                                                ? { maxWidth: "50%" }
                                                : { maxWidth: "100%" }}>
                                        <div className="p-3 border-bottom caption-section">
                                            {(isMobile && !selectedData?.dokumen_path) && (
                                                <div className="d-flex justify-content-end w-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => onClose()}
                                                        title="Tutup"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                            {(userData?.rukun_tetangga?.id === selectedData.id_rt || userData?.rw?.id === selectedData.id_rw || role === 'admin') ? (
                                                <div className="d-flex">
                                                    <h5 className="fw-bold mb-1 mt-2 me-auto">{selectedData.judul}</h5>
                                                    <Role role={["rt", "rw", 'sekretaris', 'admin']}>
                                                        <button
                                                            className="btn komen btn-primary my-auto px-1"
                                                            title="Export Pengumuman ke PDF"
                                                            style={{ border: "none" }}
                                                            onClick={() => {
                                                                // window.location.href = `/${role}/pengumuman/${selectedData.id}/export-pdf`

                                                                axios({
                                                                    url: `/${role}/pengumuman/${selectedData.id}/export-pdf`,
                                                                    method: "GET",
                                                                    responseType: "blob"
                                                                })
                                                                    .then((response) => {
                                                                        const url = window.URL.createObjectURL(new Blob([response.data]))
                                                                        const link = document.createElement("a")
                                                                        link.href = url
                                                                        link.setAttribute(
                                                                            "download",
                                                                            `Pengumuman-${selectedData.judul}.pdf`
                                                                        )
                                                                        document.body.appendChild(link)
                                                                        link.click()
                                                                        link.remove()
                                                                    })
                                                                    .catch((err) => console.error(err))
                                                            }}
                                                        >
                                                            <i className="far fa-file-pdf me-2"></i>
                                                        </button>
                                                    </Role>
                                                    <Role role={selectedData.rukun_tetangga ? ["rt", "sekretaris", "admin"] : ["rw", "sekretaris", "admin"]} >
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
                                                    {selectedData.rukun_tetangga ? selectedData.rukun_tetangga.nama_anggota_rt : selectedData.rw.nama_anggota_rw}
                                                </strong> • {" "}
                                                {selectedData.rukun_tetangga && `RT ${selectedData.rukun_tetangga?.nomor_rt}/`}
                                                RW {selectedData.rw?.nomor_rw}{" "}
                                                • <FormatWaktu createdAt={selectedData.created_at} />
                                            </small>
                                            <div
                                                ref={textRef}
                                                className={`my-2 isi-pengumuman ${captionExpanded ? "expanded" : "clamped"}`}
                                            >
                                                <table className={`${isMobile ? 'mb-2' : 'mb-3'}`}>
                                                    {selectedData.tanggal &&
                                                        <>
                                                            <tr>
                                                                <td><strong>Hari / Tanggal</strong></td>
                                                                <td><span className="me-2 ms-1">:</span></td>
                                                                <td>{hariFormatted}, {tanggalFormatted}</td>
                                                            </tr>
                                                            <tr>
                                                                <td><strong>Pukul</strong></td>
                                                                <td><span className="me-2 ms-1">:</span></td>
                                                                <td>{waktuFormatted}</td>
                                                            </tr>
                                                        </>
                                                    }
                                                    {selectedData.tempat &&
                                                        <tr>
                                                            <td><strong>Tempat</strong></td>
                                                            <td><span className="me-2 ms-1">:</span></td>
                                                            <td>{selectedData.tempat}</td>
                                                        </tr>
                                                    }
                                                </table>
                                                <div dangerouslySetInnerHTML={{ __html: selectedData.isi }} />
                                            </div>
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
                                                        <small className="fw-bold text-muted">
                                                            • {komen?.role_snapshot?.length <= 2
                                                                ? `${komen?.role_snapshot?.toUpperCase() ?? '(role tidak ada)'}`
                                                                : `${komen?.role_snapshot?.replace(/\b\w/g, (char) => char.toUpperCase()) ?? '(role tidak ada)'}`
                                                            }
                                                        </small>{" "}
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
                                                                    title="Lihat Lampiran"
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
                                                    <button
                                                        onClick={() => setPreview({ show: false, src: "", type: "" })}
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
                                                        title="Tutup"
                                                    >
                                                        ✕
                                                    </button>
                                                    {preview.type === "image" ? (
                                                        <img
                                                            src={preview.src}
                                                            alt="Preview"
                                                            style={isMobile ? {
                                                                maxWidth: "90%",
                                                                maxHeight: "80%",
                                                                objectFit: "contain",
                                                                borderRadius: "10px",
                                                            } : {
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
                                                            style={isMobile ? {
                                                                maxWidth: "90%",
                                                                maxHeight: "80%",
                                                                borderRadius: "10px",
                                                                backgroundColor: "black",
                                                            } : {
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
                                                            style={isMobile ? {
                                                                width: "90%",
                                                                height: "80%",
                                                                borderRadius: "10px",
                                                                backgroundColor: "white",
                                                            } : {
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
                                        <div className="komen p-3 border-top" style={
                                            isMobile
                                                ? {
                                                    position: 'sticky',
                                                    bottom: '0',
                                                    backgroundColor: 'white',
                                                } : {}
                                        }>
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
                                                <Role role={['rt', 'rw', 'sekretaris', 'admin']}>
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

export function EditPengumuman({ editKategori, toggle, onUpdated, onDeleted, pengumuman, role }) {
    const { data, setData } = useForm({
        judul: pengumuman.judul || "",
        isi: pengumuman.isi || "",
        kategori: pengumuman.kategori || "",
        tanggal: pengumuman.tanggal || "",
        tempat: pengumuman.tempat || "",
        dokumen: null,
    }, { forceFormData: true })

    const [previewUrl, setPreviewUrl] = useState(null)
    const [showAlert, setShowAlert] = useState(false)
    const [preview, setPreview] = useState({
        show: false,
        type: "",
        src: "",
    })

    const deletePengumuman = () => {
        setShowAlert(true)
    }

    const confirmDelete = (e) => {
        e.preventDefault()
        setShowAlert(false)

        axios.delete(`/${role}/pengumuman/${pengumuman.id}`)
            .then(res => {
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
        formData.append('tanggal', data.tanggal)
        formData.append('tempat', data.tempat)
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
    const fileName = previewUrl?.src?.split('/').pop().toLowerCase() || ""
    const filePath = previewUrl?.src?.toLowerCase() || ""
    const isMobile = useIsMobile()

    return (
        <div className={`d-flex modal-komen ${isMobile ? 'flex-col mobile' : 'flex-row desktop'}`}>
            {previewUrl ? (
                <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center"
                    style={
                        isMobile
                            ? {
                                width: "100%",
                                height: "50vh", // jadi 50% tinggi modal/layar
                                order: -1, // pindah ke atas
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }
                            : {
                                maxWidth: "50%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }
                    }>
                    {isMobile && (
                        <>
                            <button
                                onClick={() =>
                                    setPreview({
                                        show: true,
                                        type: fileName.endsWith(".pdf")
                                            ? "pdf"
                                            : fileName.match(/\.(mp4|webm|avi)$/)
                                                ? "video"
                                                : "image",
                                        src: getFileUrl(filePath),
                                    })
                                }
                                style={{
                                    position: "absolute",
                                    top: "5px",
                                    left: "5px",
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
                                title="Expand"
                            >
                                <i className="fa-solid fa-expand"></i>
                            </button>
                            <button
                                onClick={() => toggle()}
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
                                title="Kembali"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                        </>
                    )}
                    <div id="preview">
                        {previewUrl && previewUrl.type === "image" && (
                            <img
                                src={getFileUrl(previewUrl.src)}
                                alt="Preview"
                                style={{
                                    maxHeight: isMobile ? "100%" : "80vh",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                        {previewUrl && previewUrl.type === "video" && (
                            <video
                                src={getFileUrl(previewUrl.src)}
                                controls
                                autoPlay
                                loop
                                style={{
                                    maxHeight: isMobile ? "100%" : "80vh",
                                    maxWidth: "100%",
                                    objectFit: "contain",
                                }}
                            />
                        )}
                        {previewUrl && previewUrl.type === "pdf" && (
                            <embed
                                src={getFileUrl(previewUrl.src)}
                                type="application/pdf"
                                className="pdf-preview"
                                style={{
                                    width: "100%",
                                    height: isMobile ? "100%" : "80vh",
                                }}

                            />
                        )}
                        {previewUrl && previewUrl.type === "other" && <p>File dipilih: {previewUrl.name}</p>}
                    </div>
                </div>
            ) : (
                ""
            )}
            <div className="flex-fill d-flex flex-column" style={isMobile
                ? {
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }
                : previewUrl
                    ? { maxWidth: "50%" }
                    : { maxWidth: "100%" }}
            >
                <div className="p-3" style={{ height: "100%", width: '100%' }}>
                    {(!isMobile || !previewUrl) && (<div className="d-flex justify-content-end w-100">
                        <button
                            type="button"
                            onClick={() => toggle()}
                            title="Kembali"
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                    </div>)}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-2">
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

                        <div className="mb-2">
                            <label className="form-label">Kategori</label>
                            <CreatableSelect
                                placeholder="Pilih atau buat kategori baru..."
                                value={data.kategori ? { value: data.kategori, label: data.kategori } : null}
                                onChange={(selected) => setData("kategori", selected ? selected.value : "")}
                                options={editKategori.map((kat) => ({
                                    value: kat,
                                    label: kat,
                                }))}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                noOptionsMessage={() => "Ketik untuk membuat kategori baru"}
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        border: 0,
                                        borderBottom: "1px solid lightgray",
                                        borderRadius: 0,
                                        boxShadow: "none",
                                    }),
                                }}
                            />
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Tanggal Pelaksanaan</label>
                            <input
                                name="tanggal"
                                type="datetime-local"
                                className="tambah-kategori form-control"
                                value={data.tanggal}
                                onChange={(tanggal) => setData('tanggal', tanggal.target.value)}
                            />
                            <small className="mt-1 text-muted">Opsional</small>
                        </div>

                        <div className="mb-2">
                            <label className="form-label">Tempat Pelaksanaan</label>
                            <input
                                name="tempat"
                                type="text"
                                className="tambah-kategori form-control"
                                value={data.tempat}
                                onChange={(e) => setData("tempat", e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-2">
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

                        <div className="mb-2">
                            <input
                                type="file"
                                id="fileInput"
                                name="file"
                                className="d-none"
                                onChange={handleFileChange}
                                accept=".doc,.docx,.xls,.xlsx,.pdf"
                            />
                            <small className="text-muted d-block mt-2">
                                Dokumen (Opsional, Max 2MB: .doc, .docx, .pdf)
                            </small>
                            <button
                                type="button"
                                className="edit-file btn btn-outline-primary m-0"
                                title="Upload File"
                                onClick={() => document.getElementById('fileInput').click()}
                            >
                                <i className="fas fa-upload me-2"></i>
                                <small>
                                    Upload File
                                </small>
                            </button>
                            {pengumuman?.dokumen_name && !data.dokumen && (
                                <small className="text-muted d-block mt-2" style={{ wordBreak: 'break-all' }}>
                                    File lama: {pengumuman.dokumen_name}
                                </small>
                            )}
                            {data.dokumen && (
                                <small className="text-success d-block mt-2" style={{ wordBreak: 'break-all' }}>
                                    File dipilih: {data.dokumen.name}
                                </small>
                            )}
                        </div>

                        <div className="d-flex justify-content-between" style={{ marginTop: "auto" }}>
                            <button
                                type="button"
                                onClick={deletePengumuman}
                                className="btn btn-danger"
                            >
                                <i className="fas fa-trash me-2"></i>
                                Hapus
                            </button>
                            <button type="submit" className="btn btn-primary">
                                <i className="fas fa-save me-2"></i>
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
                            <button
                                onClick={() => setPreview({ show: false, src: "", type: "" })}
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
                                title="Tutup"
                            >
                                ✕
                            </button>
                            {preview.type === "image" ? (
                                <img
                                    src={preview.src}
                                    alt="Preview"
                                    style={isMobile ? {
                                        maxWidth: "90%",
                                        maxHeight: "80%",
                                        objectFit: "contain",
                                        borderRadius: "10px",
                                    } : {
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
                                    style={isMobile ? {
                                        maxWidth: "90%",
                                        maxHeight: "80%",
                                        borderRadius: "10px",
                                        backgroundColor: "black",
                                    } : {
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
                                    style={isMobile ? {
                                        width: "90%",
                                        height: "80%",
                                        borderRadius: "10px",
                                        backgroundColor: "white",
                                    } : {
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
            </div>
        </div>
    )
}

export function TambahPengumuman({ kategori, tambahShow, onClose, onAdded, role, rwList, rtList }) {
    const { data, setData } = useForm({
        judul: "",
        kategori: "",
        tanggal: "",
        tempat: "",
        isi: "",
        id_rw: "",
        id_rt: "",
        dokumen: null,
    }, { forceFormData: true })

    const [previewUrl, setPreviewUrl] = useState(null)
    const fileInputRef = useRef(null)
    const [preview, setPreview] = useState({
        show: false,
        type: "",
        src: "",
    })
    const { isiRef } = useRef(null)

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
        formData.append('tanggal', data.tanggal)
        formData.append('tempat', data.tempat)
        formData.append('id_rw', data.id_rw ?? "")
        formData.append('id_rt', data.id_rt ?? "")

        if (data.dokumen) formData.append('dokumen', data.dokumen)

        axios.post(`/${role}/pengumuman`, formData)
            .then(res => {
                if (onAdded) {
                    onAdded(res.data)
                }
                setData({
                    judul: "",
                    kategori: "",
                    tanggal: "",
                    tempat: "",
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

    const isMobile = useIsMobile()
    const [filteredRt, setFilteredRt] = useState([]);

    if (!tambahShow) return null

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
                onClick={() => {
                    onClose()
                }}
            >
                <div
                    className={`modal-dialog modal-komen modal-lg modal-dialog-scrollable modal-dialog-centered ${isMobile ? 'mobile' : 'desktop'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`modal-content modal-komen shadow-lg border-0 ${isMobile ? 'mobile' : 'desktop'}`}>
                        <div className="modal-body p-0 m-0">
                            <div className={`d-flex modal-komen ${isMobile ? 'flex-col mobile' : 'flex-row desktop'}`}>
                                {previewUrl ? (
                                    <div className="flex-fill border-end bg-black d-flex align-items-center justify-content-center" style={
                                        isMobile
                                            ? {
                                                width: "100%",
                                                height: "50vh", // jadi 50% tinggi modal/layar
                                                order: -1, // pindah ke atas
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }
                                            : {
                                                maxWidth: "50%",
                                                height: "100%",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }
                                    }
                                    >
                                        {isMobile && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setPreview({
                                                            show: true,
                                                            type: previewUrl?.type === ("pdf")
                                                                ? "pdf"
                                                                : previewUrl?.type === ("video")
                                                                    ? "video"
                                                                    : "image",
                                                            src: getFileUrl(previewUrl?.src),
                                                        })
                                                    }
                                                    style={{
                                                        position: "absolute",
                                                        top: "5px",
                                                        left: "5px",
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
                                                    title="Expand"
                                                >
                                                    <i className="fa-solid fa-expand"></i>
                                                </button>
                                                <button
                                                    onClick={() => onClose()}
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
                                                    title="Tutup"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        )}
                                        <div id="preview">
                                            {previewUrl && previewUrl.type === "image" && (
                                                <img
                                                    src={getFileUrl(previewUrl.src)}
                                                    alt="Preview"
                                                    style={{
                                                        maxHeight: isMobile ? "100%" : "80vh",
                                                        maxWidth: "100%",
                                                        objectFit: "contain",
                                                    }}
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "video" && (
                                                <video
                                                    src={getFileUrl(previewUrl.src)}
                                                    controls
                                                    autoPlay
                                                    loop
                                                    style={{
                                                        maxHeight: isMobile ? "100%" : "80vh",
                                                        maxWidth: "100%",
                                                        objectFit: "contain",
                                                    }}
                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "pdf" && (
                                                <embed
                                                    src={getFileUrl(previewUrl.src)}
                                                    type="application/pdf"
                                                    className="pdf-preview"
                                                    style={{
                                                        width: "100%",
                                                        height: isMobile ? "100%" : "80vh",
                                                    }}

                                                />
                                            )}
                                            {previewUrl && previewUrl.type === "other" && <p>File dipilih: {previewUrl.name}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    ""
                                )}
                                <div className="flex-fill d-flex flex-column" style={isMobile
                                    ? {
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }
                                    : previewUrl
                                        ? { maxWidth: "50%" }
                                        : { maxWidth: "100%" }}
                                >
                                    <div className="p-3" style={{ height: "100%", width: '100%' }}>
                                        {(isMobile && !previewUrl) && (<div className="d-flex justify-content-end w-100">
                                            <button
                                                type="button"
                                                onClick={() => onClose()}
                                                title="Tutup"
                                            >
                                                ✕
                                            </button>
                                        </div>)}
                                        <div className="flex-grow-1 overflow-auto komen-section" style={{ maxHeight: '100%' }}>
                                            <form onSubmit={handleSubmit}>
                                                <Role role={['admin']}>
                                                    {/* PILIH RW */}
                                                    <div className="mb-3">
                                                        <label className="form-label">RW</label>
                                                        <small>-Wajib dipilih</small>
                                                        <select
                                                            className="form-control"
                                                            value={data.id_rw || ""}
                                                            onChange={(e) => {
                                                                const rwId = e.target.value;
                                                                setData("id_rw", rwId);

                                                                // Reset RT agar tidak salah pilih
                                                                setData("id_rt", "");

                                                                // Filter RT berdasar RW
                                                                const list = rtList.filter(rt => rt.id_rw == rwId);
                                                                setFilteredRt(list);
                                                            }}
                                                            required
                                                            style={{
                                                                border: "0",
                                                                borderBottom: "1px solid lightgray",
                                                                borderRadius: "0",
                                                            }}
                                                        >
                                                            <option value="" disabled>-- Pilih RW --</option>
                                                            {rwList?.map((rw) => (
                                                                <option key={rw.id} value={rw.id}>
                                                                    RW {rw.nomor_rw} - {rw.nama_anggota_rw}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* PILIH RT */}
                                                    <div className="mb-3">
                                                        <label className="form-label">RT</label>
                                                        <small>-Opsional (jika untuk pengumuman rw, kosongkan)</small>
                                                        <select
                                                            className="form-control"
                                                            value={data.id_rt || ""}
                                                            onChange={(e) => setData("id_rt", e.target.value)}
                                                            disabled={filteredRt.length === 0}
                                                            style={{
                                                                border: "0",
                                                                borderBottom: "1px solid lightgray",
                                                                borderRadius: "0",
                                                            }}
                                                        >
                                                            <option value="" disabled>-- Pilih RT --</option>
                                                            {filteredRt.map((rt) => (
                                                                <option key={rt.id} value={rt.id}>
                                                                    RT {rt.nomor_rt} - {rt.nama_anggota_rt}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Role>
                                                <div className="mb-2">
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

                                                <div className="mb-2">
                                                    <label className="form-label">Kategori</label>
                                                    <CreatableSelect
                                                        placeholder="Pilih atau buat kategori baru..."
                                                        value={data.kategori ? { value: data.kategori, label: data.kategori } : null}
                                                        onChange={(selected) => setData("kategori", selected ? selected.value : "")}
                                                        options={kategori.map((kat) => ({
                                                            value: kat,
                                                            label: kat,
                                                        }))}
                                                        className="react-select-container"
                                                        classNamePrefix="react-select"
                                                        noOptionsMessage={() => "Ketik untuk membuat kategori baru"}
                                                        styles={{
                                                            control: (base) => ({
                                                                ...base,
                                                                border: 0,
                                                                borderBottom: "1px solid lightgray",
                                                                borderRadius: 0,
                                                                boxShadow: "none",
                                                            }),
                                                        }}
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-2">
                                                    <label className="form-label">Tanggal Pelaksanaan</label>
                                                    <input
                                                        name="tanggal"
                                                        type="datetime-local"
                                                        className="tambah-kategori form-control"
                                                        value={data.tanggal}
                                                        onChange={(tanggal) => setData('tanggal', tanggal.target.value)}
                                                    />
                                                    <small className="mt-1 text-muted">Opsional</small>
                                                </div>

                                                <div className="mb-2">
                                                    <label className="form-label">Tempat Pelaksanaan</label>
                                                    <input
                                                        name="tempat"
                                                        type="text"
                                                        className="tambah-kategori form-control"
                                                        value={data.tempat}
                                                        onChange={(e) => setData("tempat", e.target.value)}
                                                    />
                                                </div>

                                                <div className="mb-2">
                                                    <label className="form-label">Isi</label>
                                                    <textarea
                                                        ref={isiRef}
                                                        name="isi"
                                                        className="edit-isi form-control"
                                                        rows="4"
                                                        value={data.isi}
                                                        onChange={(e) => setData("isi", e.target.value)}
                                                        required
                                                    ></textarea>
                                                </div>

                                                <div className="mb-2">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        id="fileInput"
                                                        name="dokumen"
                                                        className="d-none"
                                                        onChange={handleFileChange}
                                                        accept=".doc,.docx,.xls,.xlsx,.pdf"
                                                    />
                                                    <small className="text-muted d-block mt-2">
                                                        Opsional (Dokumen, Max 2MB: .doc, .docx, .pdf)
                                                    </small>
                                                    <button
                                                        type="button"
                                                        className="edit-file btn btn-outline-primary m-0"
                                                        title="Upload File"
                                                        onClick={() => document.getElementById('fileInput').click()}
                                                    >
                                                        <i className="fas fa-upload me-2"></i>
                                                        <small>
                                                            Upload File
                                                        </small>
                                                    </button>
                                                    {data.dokumen && (
                                                        <small className="text-success d-block mt-2" style={{ wordBreak: 'break-all' }}>
                                                            File dipilih: {data.dokumen.name}
                                                        </small>
                                                    )}
                                                </div>

                                                <div className="d-flex justify-content-end" style={{ marginTop: "auto" }}>
                                                    <button type="submit" className="btn btn-primary my-auto">
                                                        <i className="fas fa-save me-2"></i>
                                                        Simpan
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
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
                                                <button
                                                    onClick={() => setPreview({ show: false, src: "", type: "" })}
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
                                                    title="Tutup"
                                                >
                                                    ✕
                                                </button>
                                                {preview.type === "image" ? (
                                                    <img
                                                        src={getFileUrl(preview.src)}
                                                        alt="Preview"
                                                        style={isMobile ? {
                                                            maxWidth: "90%",
                                                            maxHeight: "80%",
                                                            objectFit: "contain",
                                                            borderRadius: "10px",
                                                        } : {
                                                            maxWidth: "90%",
                                                            maxHeight: "90%",
                                                            objectFit: "contain",
                                                            borderRadius: "10px",
                                                        }}
                                                    />
                                                ) : preview.type === "video" ? (
                                                    <video
                                                        src={getFileUrl(preview.src)}
                                                        controls
                                                        autoPlay
                                                        style={isMobile ? {
                                                            maxWidth: "90%",
                                                            maxHeight: "80%",
                                                            borderRadius: "10px",
                                                            backgroundColor: "black",
                                                        } : {
                                                            maxWidth: "90%",
                                                            maxHeight: "90%",
                                                            borderRadius: "10px",
                                                            backgroundColor: "black",
                                                        }}
                                                    />
                                                ) : preview.type === "pdf" ? (
                                                    <embed
                                                        src={getFileUrl(preview.src)}
                                                        type="application/pdf"
                                                        style={isMobile ? {
                                                            width: "90%",
                                                            height: "80%",
                                                            borderRadius: "10px",
                                                            backgroundColor: "white",
                                                        } : {
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function DetailWarga({ selectData, detailShow, onClose }) {
    if (!detailShow || !selectData) return null

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
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title text-white">Detail Warga</h5>
                        </div>

                        <div className="modal-body kk d-block p-4 mt-0">
                            {/* <div className="kk-header w-100">
                                <div className="kk-header-main-title">
                                    <h4>Detail Warga</h4>
                                </div>
                            </div> */}

                            <div className="kk-info-grid mb-0">
                                <div className="kk-info-item">
                                    <p><strong>No. KK</strong> : {selectData.no_kk ?? '-'}</p>
                                    <p><strong>NIK</strong> : {selectData.nik ?? '-'}</p>
                                    <p><strong>Nama Lengkap</strong> : {selectData.nama ?? '-'}</p>
                                    <p><strong>Alamat</strong> : {selectData.kartu_keluarga?.alamat ?? '-'}</p>
                                    <p><strong>Jenis Kelamin</strong> : {selectData.jenis_kelamin.charAt(0).toUpperCase() + selectData.jenis_kelamin.slice(1) ?? '-'}</p>
                                    <p><strong>Tempat Lahir</strong> : {selectData.tempat_lahir ?? '-'}</p>
                                    <p><strong>Tanggal Lahir</strong> : {formatTanggal(selectData.tanggal_lahir) ?? '-'}</p>
                                    <p><strong>Agama</strong> : {selectData.agama ?? '-'}</p>
                                    <p><strong>Pendidikan</strong> : {selectData.pendidikan ?? '-'}</p>
                                    <p><strong>Pekerjaan</strong> : {selectData.pekerjaan ?? '-'}</p>
                                    <p><strong>Status Perkawinan</strong> : {selectData.status_perkawinan ?? '-'}</p>
                                    <p><strong>Status Hubungan <br /> dalam Keluarga</strong> : {selectData.status_hubungan_dalam_keluarga.charAt(0).toUpperCase() + selectData.status_hubungan_dalam_keluarga.slice(1) ?? '-'}</p>
                                    <p><strong>Golongan Darah</strong> : {selectData.golongan_darah ?? '-'}</p>
                                    <p><strong>Kewarganegaraan</strong> : {selectData.kewarganegaraan ?? '-'}</p>
                                    <p><strong>No Paspor</strong> : {selectData.no_paspor ?? '-'}</p>
                                    <p><strong>Tanggal Terbit Paspor</strong> : {formatTanggal(selectData.tgl_terbit_paspor) ?? '-'}</p>
                                    <p><strong>Tanggal Akhir Paspor</strong> : {formatTanggal(selectData.tgl_berakhir_paspor) ?? '-'}</p>
                                </div>
                                <div className="kk-info-item">
                                    <p><strong>No Paspor</strong> : {selectData.no_kitas ?? '-'}</p>
                                    <p><strong>Tanggal Terbit Paspor</strong> : {formatTanggal(selectData.tgl_terbit_kitas) ?? '-'}</p>
                                    <p><strong>Tanggal Akhir Paspor</strong> : {formatTanggal(selectData.tgl_berakhir_kitas) ?? '-'}</p>
                                    <p><strong>No Paspor</strong> : {selectData.no_kitap ?? '-'}</p>
                                    <p><strong>Tanggal Terbit Paspor</strong> : {formatTanggal(selectData.tgl_terbit_kitap) ?? '-'}</p>
                                    <p><strong>Tanggal Akhir Paspor</strong> : {formatTanggal(selectData.tgl_berakhir_kitap) ?? '-'}</p>
                                    <p><strong>Nama Ayah</strong> : {selectData.nama_ayah ?? '-'}</p>
                                    <p><strong>Nama Ibu</strong> : {selectData.nama_ibu ?? '-'}</p>
                                    <p><strong>Alamat Asal</strong> : {selectData.alamat_asal ?? '-'}</p>
                                    <p><strong>Alamat Domisili</strong> : {selectData.alamat_domisili ?? '-'}</p>
                                    <p><strong>Tanggal Mulai Tinggal</strong> : {formatTanggal(selectData.tanggal_mulai_tinggal) ?? '-'}</p>
                                    <p><strong>Tujuan Pindah</strong> : {selectData.tujuan_pindah ?? '-'}</p>
                                    <p><strong>Status Warga</strong> : {selectData.status_warga.charAt(0).toUpperCase() + selectData.status_warga.slice(1) ?? '-'}</p>
                                    <p><strong>RT/RW</strong> :{" "}
                                        {selectData.kartu_keluarga?.rukun_tetangga?.nomor_rt ?? '-'}/{selectData.kartu_keluarga?.rw?.nomor_rw ?? '-'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer bg-light mt-0">
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

export function TambahIuran({ tambahShow, onClose, onAdded, role, golongan, rw, rt, nik, no_kk }) {
    const [data, setData] = useState({
        id_rw: "",
        id_rt: "",
        nama: "",
        tgl_tagih: "",
        tgl_tempo: "",
        jenis: "manual",
        no_kk: "",
        nominal: "",
        periode: "",
    });

    const [golonganList, setGolonganList] = useState([])
    const [rtList, setRtList] = useState([])
    const [nikWarga, setNikWarga] = useState([])
    const [noKkWarga, setNoKkWarga] = useState([])
    const [perWarga, setPerWarga] = useState(false)
    const [perKk, setPerKk] = useState(false)
    const [filteredRt, setFilteredRt] = useState([]);

    useEffect(() => {
        setGolonganList(golongan)
        setNikWarga(nik)
        setNoKkWarga(no_kk)
        const defaults = {}
        golongan.forEach(g => {
            defaults[`periode_${g.id}`] = "1"
        })
        setData(prev => ({ ...prev, ...defaults }))
    }, [golongan, nik, no_kk])

    const handleChange = (e) => {
        setData({ ...data, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (name, selected) => {
        setData({
            ...data,
            [name]: selected?.value || ""
        });
    };

    const handleNominalChange = (id, value) => {
        setData({ ...data, [`nominal_${id}`]: value })
    }

    const handlePeriodeChange = (id, value) => {
        setData({ ...data, [`periode_${id}`]: value })
    }

    const handleChangeOption = () => {
        setData({
            id_rw: "",
            id_rt: "",
            nama: "",
            tgl_tagih: "",
            tgl_tempo: "",
            jenis: "manual",
            nik: "",
            no_kk: "",
            nominal: "",
            periode: "",
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post(`/${role}/iuran`, data)
            .then(res => {
                if (onAdded) onAdded(res.data.iuran)
                setData({
                    id_rw: "",
                    id_rt: "",
                    nama: "",
                    tgl_tagih: "",
                    tgl_tempo: "",
                    jenis: "manual",
                    no_kk: "",
                    nominal: "",
                    periode: "",
                })
                onClose()
            })
            .catch(err => {
                console.error(err)
                alert("Gagal menyimpan iuran!")
            })
    }

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }
        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    useEffect(() => {
        let filteredRt;

        if (data.id_rw) {
            filteredRt = rt?.filter(
                kk => kk.id_rw == data.id_rw
            );
        } else {
            filteredRt = rt;
        }

        if (role !== 'rw' && !data.id_rw) {
            setRtList([])
        } else {
            setRtList(filteredRt);
        }

        if (filteredRt?.length === 0) {
            setData('id_rt', '');
        }
    }, [data.id_rw]);

    if (!tambahShow) return null

    return (
        <div
            className="modal fade show"
            tabIndex="-1"
            style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)"
            }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content shadow-lg border-0">
                    <div className="modal-body p-0 m-0">
                        <div className="d-flex tambah-body flex-column" style={{ width: "100%", height: "86.5vh", overflowY: "auto" }}>
                            <div className="p-3 h-100">
                                <form onSubmit={handleSubmit} className="h-100 d-flex flex-column" id="iuran">

                                    {/* <div className="d-flex position-relative mb-3 border-bottom">
                                        {["Semua Kartu Keluarga", "Kartu Keluarga"].map((label, i) => (
                                            <button
                                                key={label}
                                                type="button"
                                                className="btn btn-opsi m-0 flex-fill"
                                                style={{
                                                    border: "none",
                                                    background: "transparent",
                                                    width: "50%",
                                                    color:
                                                        (i === 0 && !perKk) ||
                                                            (i === 1 && perKk)
                                                            ? "#4e73df"
                                                            : "gray",
                                                    fontWeight: "500",
                                                    position: "relative",
                                                    paddingBottom: "8px",
                                                }}
                                                onClick={() => {
                                                    setPerKk(i === 1)
                                                    handleChangeOption()
                                                }}
                                                disabled={data.jenis === "otomatis"}
                                                title={data.jenis === "otomatis" ? "Tidak dapat mengubah opsi saat jenis iuran otomatis dipilih" : ""}
                                            >
                                                {label}
                                            </button>
                                        ))}

                                        <motion.div
                                            layout
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            className="position-absolute"
                                            style={{
                                                height: "2px",
                                                background: "#4e73df",
                                                width: "50%",
                                                bottom: "0",
                                                left:
                                                    // perWarga ? "50%" :
                                                    perKk ? "50%" : "0%",
                                                borderRadius: "2px",
                                            }}
                                        />
                                    </div> */}

                                    <Role role={'admin'}>
                                        <div className="mb-3">
                                            <label className="form-label">Pilih RW</label>
                                            <Select
                                                options={rw?.map((item) => ({
                                                    value: item.id,
                                                    label: `RW ${item.nomor_rw}`,
                                                }))}
                                                value={
                                                    data.id_rw
                                                        ? {
                                                            value: data.id_rw,
                                                            label: `RW ${rw?.find((x) => x.id == data.id_rw)?.nomor_rw}` || "",
                                                        }
                                                        : null
                                                }
                                                onChange={(selected) => handleSelectChange('id_rw', selected)}
                                                placeholder="Pilih nomor RW..."
                                                isSearchable={true}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                noOptionsMessage={() => "Tidak ada RW yang aktif"}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        border: 0,
                                                        borderBottom: "1px solid lightgray",
                                                        borderRadius: 0,
                                                        boxShadow: "none",
                                                    }),
                                                }}
                                            />
                                        </div>
                                    </Role>

                                    <div className="mb-3">
                                        <label className="form-label">Pilih RT</label>
                                        <Select
                                            options={rtList?.map((item) => ({
                                                value: item.id,
                                                label: `RT ${item.nomor_rt}`,
                                            }))}
                                            value={
                                                data.id_rt
                                                    ? {
                                                        value: data.id_rt,
                                                        label: `RT ${rtList?.find((x) => x.id == data.id_rt)?.nomor_rt}` || "",
                                                    }
                                                    : null
                                            }
                                            onChange={(selected) => handleSelectChange('id_rt', selected)}
                                            placeholder="Pilih nomor RT..."
                                            isSearchable={true}
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            noOptionsMessage={() => data.id_rw ? "Tidak ada RT yang aktif" : "Harap pilih RW terlebihdahulu"}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    border: 0,
                                                    borderBottom: "1px solid lightgray",
                                                    borderRadius: 0,
                                                    boxShadow: "none",
                                                }),
                                            }}
                                        />
                                        {/* <select
                                            name="id_rt"
                                            className="form-control"
                                            value={data.id_rt}
                                            onChange={handleChange}
                                            style={{
                                                border: '0',
                                                borderBottom: '1px solid lightgray',
                                                borderRadius: '0',
                                            }}
                                            required
                                        >
                                            <option value="">-- Pilih RT --</option>
                                            {rt_list.length > 0 ? (
                                                rt_list.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        RT {item.nomor_rt} - {item.nama_anggota_rt}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">Tidak ada RT</option>
                                            )}
                                        </select> */}
                                    </div>

                                    {/* {perWarga && (
                                        <div className="mb-3">
                                            <label className="form-label">NIK Warga</label>
                                            <select
                                                name="nik"
                                                type="text"
                                                className="form-control"
                                                value={data.nik}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            >
                                                <option value="" selected disabled>Pilih NIK</option>
                                                {nikWarga.map((warga, index) => (
                                                    <option value={warga.nik} key={index}>{warga.nik}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )} */}

                                    {/* {perKk && (
                                        <div className="mb-3">
                                            <label className="form-label">Nomor Kartu Keluarga</label>
                                            <Select
                                                options={[
                                                    ...noKkWarga.map((kk) => ({
                                                        value: kk.no_kk,
                                                        label: kk.no_kk,
                                                    })),
                                                ]}
                                                value={
                                                    data.no_kk
                                                        ? { value: data.no_kk, label: data.no_kk }
                                                        : null
                                                }
                                                onChange={selected => handleChange({ target: { name: "no_kk", value: selected ? selected.value : "" } })}
                                                placeholder="Pilih atau ketik nomor KK..."
                                                isSearchable={true}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                noOptionsMessage={() => "Tidak ada Kartu Keluarga"}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        border: 0,
                                                        borderBottom: "1px solid lightgray",
                                                        borderRadius: 0,
                                                        boxShadow: "none",
                                                    }),
                                                }}
                                            />
                                        </div>
                                    )} */}

                                    <div className="mb-3">
                                        <label className="form-label">Nama Iuran</label>
                                        <input
                                            name="nama"
                                            type="text"
                                            className="tambah-judul form-control"
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Tanggal Tagih</label>
                                        <input
                                            name="tgl_tagih"
                                            type="date"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                            style={{
                                                border: '0',
                                                borderBottom: '1px solid lightgray',
                                                borderRadius: '0',
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Tanggal Tempo</label>
                                        <input
                                            name="tgl_tempo"
                                            type="date"
                                            className="form-control"
                                            onChange={handleChange}
                                            required
                                            style={{
                                                border: '0',
                                                borderBottom: '1px solid lightgray',
                                                borderRadius: '0',
                                            }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Jenis Iuran</label>
                                        <select
                                            name="jenis"
                                            className="tambah-judul form-control"
                                            value={data.jenis}
                                            onChange={handleChange}
                                            style={{
                                                border: '0',
                                                borderBottom: '1px solid lightgray',
                                                borderRadius: '0',
                                            }}
                                        >
                                            <option value="manual">Manual</option>
                                            <option value="otomatis">Otomatis</option>
                                        </select>
                                    </div>

                                    {data.jenis === "manual" && (
                                        <div className="mb-3">
                                            <label className="form-label">Nominal Iuran</label>
                                            <input
                                                type="number"
                                                name="nominal"
                                                className="form-control"
                                                onChange={handleChange}
                                                onInput={(e) => {
                                                    if (e.target.value.length > 13) {
                                                        e.target.value = e.target.value.slice(0, 13)
                                                    }
                                                }}
                                                required
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            />
                                        </div>
                                    )}

                                    {data.jenis === "otomatis" && (
                                        <>
                                            <h5 className="mb-3">Nominal per Golongan:</h5>
                                            {golonganList.map((g) => {
                                                const items = []
                                                for (let i = 1; i <= 12; i++) {
                                                    items.push(<option value={i} key={i}>{i} Bulan</option>)
                                                }

                                                return (
                                                    <div key={g.id} className="mb-3 d-flex col gap-3">
                                                        <div className="w-100">
                                                            <label>
                                                                {g.jenis === "umkm"
                                                                    ? g.jenis.toUpperCase()
                                                                    : g.jenis.charAt(0).toUpperCase() + g.jenis.slice(1)}</label>
                                                            <input
                                                                type="number"
                                                                className="tambah-judul form-control"
                                                                onInput={(e) => {
                                                                    if (e.target.value.length > 13 || e.target.value.length < 0) {
                                                                        e.target.value = e.target.value.slice(0, 13)
                                                                    }
                                                                }}
                                                                onChange={(e) => handleNominalChange(g.id, e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                        {/* <div className="w-100">
                                                                <label>Periode</label>
                                                                <select
                                                                    name="periode"
                                                                    className="tambah-judul form-control"
                                                                    onChange={(e) => handlePeriodeChange(g.id, e.target.value)}
                                                                    required
                                                                    style={{
                                                                        border: '0',
                                                                        borderBottom: '1px solid lightgray',
                                                                        borderRadius: '0',
                                                                        width: '100%',
                                                                    }}
                                                                >
                                                                    {items}
                                                                </select>
                                                            </div> */}
                                                    </div>
                                                )
                                            })}
                                        </>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer border-top mt-0" style={{ position: "sticky", zIndex: '10' }}>
                        <button type="submit" form="iuran" className="btn btn-primary" style={{ width: "25%" }}>
                            <i className="fas fa-save me-2"></i> Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function EditIuranOtomatis({ editShow, onClose, onUpdated, role, golongan, iuran, iuranGol }) {
    const { data, setData } = useForm({
        nominal: "",
        periode: "",
    })

    useEffect(() => {
        if (iuranGol) {
            setData({
                nominal: iuranGol.nominal || "",
                periode: iuranGol.periode || "",
            });
        }
    }, [iuranGol, setData]);

    const handleSubmit = (e) => {
        e.preventDefault()

        axios.put(`/${role}/iuran/${iuranGol.id}/otomatis`, data)
            .then(res => {
                if (onUpdated) onUpdated(res.data.iuran)
                setData({
                    nominal: "",
                    periode: "",
                })
                onClose()
            })
    }

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    if (!editShow) return null

    let items = []
    for (let i = 1; i <= 12; i++) {
        items.push(<option value={i} key={i}>{i} Bulan</option>)
    }

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
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex tambah-body flex-column" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                                <div className="p-3">
                                    <form onSubmit={handleSubmit} className="h-100">
                                        <div className="mb-3">
                                            <label className="form-label">Iuran Golongan</label>
                                            <input
                                                name="nama"
                                                type="text"
                                                value={
                                                    golongan.jenis.charAt(0).toUpperCase() + golongan.jenis.slice(1)
                                                }
                                                className="tambah-judul form-control"
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tanggal Tagih</label>
                                            <input
                                                name="tgl_tagih"
                                                type="date"
                                                value={iuran.tgl_tagih}
                                                className="tambah-kategori form-control"
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tanggal Tempo</label>
                                            <input
                                                name="tgl_tempo"
                                                type="date"
                                                value={iuran.tgl_tempo}
                                                className="tambah-kategori form-control"
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Nominal Iuran</label>
                                            <input
                                                type="number"
                                                name="nominal"
                                                value={data.nominal}
                                                className="tambah-judul form-control"
                                                onChange={(e) => setData("nominal", e.target.value)}
                                                onInput={(e) => {
                                                    if (e.target.value.length > 13) {
                                                        e.target.value = e.target.value.slice(0, 13);
                                                    }
                                                }}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label>Periode Iuran</label>
                                            <select
                                                name="periode"
                                                className="tambah-judul form-control"
                                                value={data.periode}
                                                onChange={(e) => setData("periode", e.target.value)}
                                                required
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                    width: '100%',
                                                }}
                                            >
                                                {items}
                                            </select>
                                        </div>

                                        <button type="submit" className="btn btn-primary ms-auto mt-auto">
                                            <i className="fas fa-save me-2"></i>
                                            Simpan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function EditIuranManual({ editShow, onClose, onUpdated, role, iuran }) {
    const { data, setData } = useForm({
        nominal: "",
    })

    useEffect(() => {
        if (iuran) {
            setData({
                nominal: iuran.nominal || "",
            });
        }
    }, [iuran]);

    const handleSubmit = (e) => {
        e.preventDefault()

        axios.put(`/${role}/iuran/${iuran.id}/manual`, data)
            .then(res => {
                if (onUpdated) onUpdated(res.data.iuran)
                setData({
                    nominal: "",
                })
                onClose()
            })
    }

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    if (!editShow) return null

    let items = []
    for (let i = 1; i <= 12; i++) {
        items.push(<option value={i} key={i}>{i} Bulan</option>)
    }

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
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex tambah-body flex-column" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                                <div className="p-3">
                                    <form onSubmit={handleSubmit} className="h-100">
                                        <div className="mb-3">
                                            <label className="form-label">Iuran</label>
                                            <input
                                                name="nama"
                                                type="text"
                                                value={iuran.nama}
                                                className="tambah-judul form-control"
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tanggal Tagih</label>
                                            <input
                                                name="tgl_tagih"
                                                type="date"
                                                value={iuran.tgl_tagih}
                                                className="tambah-kategori form-control"
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tanggal Tempo</label>
                                            <input
                                                name="tgl_tempo"
                                                type="date"
                                                value={iuran.tgl_tempo}
                                                className="tambah-kategori form-control"
                                                disabled
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Nominal Iuran</label>
                                            <input
                                                type="number"
                                                name="nominal"
                                                value={data.nominal}
                                                className="tambah-judul form-control"
                                                onChange={(e) => setData("nominal", e.target.value)}
                                                onInput={(e) => {
                                                    if (e.target.value.length > 13) {
                                                        e.target.value = e.target.value.slice(0, 13);
                                                    }
                                                }}
                                                required
                                            />
                                        </div>

                                        <button type="submit" className="btn btn-primary ms-auto mt-auto">
                                            <i className="fas fa-save me-2"></i>
                                            Simpan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function TambahTagihan({ tambahShow, onClose, onUpdated, role, iuran, kk_list }) {
    const { data, setData } = useForm({
        id_iuran: "",
        nama: "",
        nominal: "",
        tgl_tagih: "",
        no_kk: "",
    })

    const [kkList, setKkList] = useState([])

    useEffect(() => {
        if (!iuran || iuran.length === 0) return
        const selected = iuran.find((item) => item.id == data.id_iuran)
        if (selected) {
            const kkFinder = kk_list.filter(kk => kk.rw.id === selected.id)
            console.log(kkFinder)
            console.log(kkList)
            setKkList(kkFinder)
            setData((prev) => ({
                ...prev,
                nama: selected.nama || "",
                nominal: selected.nominal || "",
                tgl_tagih: selected.tgl_tagih || "",
                no_kk: "semua",
            }))
        }
    }, [data.id_iuran, iuran])

    const handleSubmit = (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('id_iuran', data.id_iuran)
        formData.append('nama', data.nama)
        formData.append('nominal', data.nominal)
        formData.append('tgl_tagih', data.tgl_tagih)
        formData.append('no_kk', data.no_kk)

        axios.post(`/${role}/tagihan`, formData)
            .then((res) => {
                console.log(res)
                if (onUpdated) onUpdated(res.data.tagihan)
                setData({
                    id_iuran: "",
                    nama: "",
                    nominal: "",
                    tgl_tagih: "",
                    no_kk: "",
                })
                onClose()
            })
            .catch((err) => {
                console.error(err.response?.data || err)
                alert("Gagal membuat tagihan! Lihat console untuk detail.")
            })
    }

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    const isFormComplete = Object.values(data).every(value => value !== "" && value !== null)

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
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose()
                }}
            >
                <div
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex tambah-body flex-column" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                                <div className="p-3">
                                    <form onSubmit={handleSubmit} className="h-100">
                                        <div className="mb-3">
                                            <div className="mb-3">
                                                <label className="form-label">Jenis Iuran</label>
                                                <Select
                                                    options={iuran?.map((item) => ({
                                                        value: item.id,
                                                        label: item.nama,
                                                    }))}
                                                    value={
                                                        data.id_iuran
                                                            ? {
                                                                value: data.id_iuran,
                                                                label: iuran?.find((x) => x.id == data.id_iuran)?.nama || "",
                                                            }
                                                            : null
                                                    }
                                                    onChange={(selected) => setData("id_iuran", selected?.value || "")}
                                                    placeholder="Pilih jenis iuran..."
                                                    isSearchable={true}
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    noOptionsMessage={() => "Tidak ada Iuran"}
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            border: 0,
                                                            borderBottom: "1px solid lightgray",
                                                            borderRadius: 0,
                                                            boxShadow: "none",
                                                        }),
                                                    }}
                                                />
                                                {/* <select
                                                name="id_iuran"
                                                value={data.id_iuran}
                                                className="form-control"
                                                onChange={(e) => setData('id_iuran', e.target.value)}
                                                required
                                                title="Pilih Iuran"
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            >
                                                <option value="" disabled>-- Pilih Iuran --</option>
                                                {iuran.length > 0 ?
                                                    iuran.map((iuran) => (
                                                        <option key={iuran.id} value={iuran.id}>{iuran.nama}</option>
                                                    )) : (
                                                        <option value="" title={role === 'rt' && "Tolong hubungi RW anda untuk ditindaklanjuti."} className="text-center" disabled>-- Tidak ada iuran yang tersedia --</option>
                                                    )
                                                }
                                            </select> */}
                                            </div>

                                            <label className="form-label">Nomor Kartu Keluarga</label>{console.log(kkList?.length)}
                                            <Select
                                                options={
                                                    kkList?.length ? [
                                                        { value: "semua", label: "Semua Kartu Keluarga" },
                                                        ...kkList.map((kk) => ({
                                                            value: kk.no_kk,
                                                            label: kk.no_kk,
                                                        })),
                                                    ] : []
                                                }
                                                value={
                                                    data.no_kk
                                                        ? { value: data.no_kk, label: data.no_kk === "semua" ? "Semua Kartu Keluarga" : data.no_kk }
                                                        : null
                                                }
                                                onChange={(selected) => setData("no_kk", selected?.value || "")}
                                                placeholder="Pilih atau ketik nomor KK..."
                                                isSearchable={true}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                noOptionsMessage={() => data.id_iuran ? "Tidak ada Kartu Keluarga" : "Harap Pilih Iuran Terlebih dahulu"}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        border: 0,
                                                        borderBottom: "1px solid lightgray",
                                                        borderRadius: 0,
                                                        boxShadow: "none",
                                                    }),
                                                }}
                                            />
                                            {/* <select
                                                name="no_kk"
                                                value={data.no_kk}
                                                className="form-control"
                                                onChange={(e) => setData('no_kk', e.target.value)}
                                                required
                                                title="Pilih Kartu Keluarga"
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            >
                                                <option value="semua" selected>Semua Kartu Keluarga</option>
                                                {kk_list.length > 0 ?
                                                    kk_list.map((kk) => (
                                                        <option key={kk.no_kk} value={kk.no_kk}>{kk.no_kk}</option>
                                                    )) : (
                                                        <option value="" title={role === 'rt' && "Tolong hubungi RW anda untuk ditindaklanjuti."} className="text-center" disabled>-- Tidak ada Kartu Keluarga --</option>
                                                    )}
                                            </select> */}
                                        </div>



                                        <div className="mb-3">
                                            <label className="form-label">Nominal</label>
                                            <input
                                                type="number"
                                                name="nominal"
                                                value={data.nominal}
                                                className="form-control"
                                                onChange={(e) => setData('nominal', e.target.value)}
                                                onInput={(e) => {
                                                    if (e.target.value.length > 13) {
                                                        e.target.value = e.target.value.slice(0, 13)
                                                    }
                                                }}
                                                required
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tanggal Tagih</label>
                                            <input
                                                name="tgl_tagih"
                                                type="date"
                                                value={data.tgl_tagih}
                                                className="tambah-kategori form-control"
                                                onChange={(e) => setData('tgl_tagih', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <button type="submit" className="btn btn-primary ms-auto mt-auto" disabled={!isFormComplete} title={!isFormComplete && 'Harap isi semua data yang ada'}>
                                            <i className="fas fa-save me-2"></i>
                                            Simpan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function EditTagihan({ editShow, onClose, onUpdated, role, selectedData }) {
    const { data, setData } = useForm({
        status_bayar: "",
        tgl_bayar: "",
        nominal_bayar: "",
        kategori_pembayaran: "",
        bukti_transfer: null,
    })
    const [buktiLama, setBuktiLama] = useState(null)
    const [previewBuktiTransfer, setPreviewBuktiTransfer] = useState(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (data.status_bayar === 'belum_bayar') {
            setData({
                ...data,
                tgl_bayar: "",
                nominal_bayar: "",
                kategori_pembayaran: "tunai",
                bukti_transfer: null,
            })
        }
    }, [data.status_bayar])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (!selectedFile) {
            setPreviewBuktiTransfer(null)
            setData("bukti_transfer", null)
            return
        }

        setData("bukti_transfer", selectedFile || null)

        const fileName = selectedFile.name.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewBuktiTransfer({ type: "image", src: ev.target.result })
            reader.readAsDataURL(selectedFile)
        }
    }

    useEffect(() => {
        if (selectedData) {
            setData({
                status_bayar: selectedData.status_bayar || "",
                tgl_bayar: selectedData.tgl_bayar || "",
                nominal_bayar: selectedData.nominal_bayar || "",
                kategori_pembayaran: selectedData.kategori_pembayaran || "tunai",
                bukti_transfer: selectedData.bukti_transfer || null,
            });
            setBuktiLama(selectedData.bukti_transfer || null)
        }
    }, [selectedData, setData, editShow]);

    const handleSubmit = (e) => {
        e.preventDefault()

        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (key === "bukti_transfer" && value instanceof File) {
                formData.append(key, value)
            } else {
                formData.append(key, value ?? "")
            }
        })

        axios.post(`/${role}/tagihan/${selectedData.id}?_method=PUT`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then((res) => {
                if (onUpdated) onUpdated(res.data.tagihan)
                setData({
                    status_bayar: "",
                    tgl_bayar: "",
                    nominal_bayar: "",
                    kategori_pembayaran: "tunai",
                    bukti_transfer: null,
                })
                onClose()
            })
            .catch((err) => {
                console.error(err.response?.data || err)
                alert("Gagal update tagihan! Lihat console untuk detail.")
            })
    }

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    const handleClear = () => {
        setData("bukti_transfer", null)
        setBuktiLama(null)
        setPreviewBuktiTransfer(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    useEffect(() => {
        if (data.status_bayar === 'belum_bayar') {
            setBuktiLama(null)
            setData(prev => ({
                ...prev,
                kategori_pembayaran: "tunai",
                bukti_transfer: null,
            }))
        }
    }, [data.status_bayar])

    useEffect(() => {
        if (data.kategori_pembayaran === 'tunai') {
            setData("bukti_transfer", null)
            setBuktiLama(null)
            setPreviewBuktiTransfer(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }, [data.kategori_pembayaran])

    if (!editShow) return null

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)"
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose()
                }}
            >
                <div
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex tambah-body flex-column" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                                <div className="p-3">
                                    <form onSubmit={handleSubmit} className="h-100">
                                        <div className="mb-3">
                                            <label className="form-label">Status Bayar</label>
                                            <select
                                                name="status_bayar"
                                                value={data.status_bayar}
                                                className="tambah-judul form-control"
                                                onChange={(e) => setData('status_bayar', e.target.value)}
                                                required
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            >
                                                <option value="belum_bayar">Belum Bayar</option>
                                                <option value="sudah_bayar">Sudah Bayar</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tanggal bayar</label>
                                            <input
                                                name="tgl_bayar"
                                                type="datetime-local"
                                                value={data.tgl_bayar}
                                                className="tambah-kategori form-control"
                                                onChange={(e) => setData('tgl_bayar', e.target.value)}
                                                required={data.status_bayar === "sudah_bayar"}
                                                disabled={data.status_bayar === "belum_bayar"}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Pembayaran</label>
                                            <select
                                                name="kategori_pembayaran"
                                                value={data.kategori_pembayaran}
                                                className="tambah-judul form-control"
                                                onChange={(e) => setData('kategori_pembayaran', e.target.value)}
                                                required={data.status_bayar === "sudah_bayar"}
                                                disabled={data.status_bayar === "belum_bayar"}
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            >
                                                <option value="tunai">Tunai</option>
                                                <option value="transfer">Transfer</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Nominal</label>
                                            <input
                                                type="number"
                                                name="nominal"
                                                value={selectedData.nominal}
                                                className="form-control"
                                                onInput={(e) => {
                                                    if (e.target.value.length > 13) {
                                                        e.target.value = e.target.value.slice(0, 13)
                                                    }
                                                }}
                                                disabled
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Nominal Bayar</label>
                                            <input
                                                type="number"
                                                name="nominal_bayar"
                                                value={data.nominal_bayar}
                                                className="form-control"
                                                onChange={(e) => setData('nominal_bayar', e.target.value)}
                                                onInput={(e) => {
                                                    if (e.target.value.length > 13) {
                                                        e.target.value = e.target.value.slice(0, 13)
                                                    }
                                                }}
                                                required={data.status_bayar === "sudah_bayar"}
                                                disabled={data.status_bayar === "belum_bayar"}
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            />
                                        </div>

                                        {data.kategori_pembayaran === 'transfer' && (
                                            <div className="mb-3">
                                                {(previewBuktiTransfer || buktiLama) && (
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
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleClear()
                                                            }}
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
                                                            {((previewBuktiTransfer && previewBuktiTransfer.type === "image") || (buktiLama && /\.(jpg|jpeg|png|gif)$/i.test(buktiLama))) && (
                                                                <img
                                                                    src={
                                                                        (previewBuktiTransfer && previewBuktiTransfer.type === "image")
                                                                            ? getFileUrl(previewBuktiTransfer.src)
                                                                            : (buktiLama && /\.(jpg|jpeg|png|gif)$/i.test(buktiLama))
                                                                            && getFileUrl(buktiLama)
                                                                    }
                                                                    alt="Preview"
                                                                    style={{
                                                                        maxWidth: "100%",
                                                                        maxHeight: "100%",
                                                                        objectFit: "contain"
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    id="fileInput"
                                                    name="bukti_transfer"
                                                    className="d-none"
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    onClick={(e) => { e.target.value = null }}
                                                />
                                                <button
                                                    type="button"
                                                    className="edit-file btn btn-outline-primary m-0"
                                                    title="Upload File"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    value={data.status_bayar === "belum_bayar" && null}
                                                    disabled={data.status_bayar === "belum_bayar"}
                                                >
                                                    <i className="fas fa-upload me-2"></i>
                                                    <small>
                                                        Upload Bukti Transfer
                                                    </small>
                                                </button>
                                                {(selectedData?.bukti_transfer !== data.bukti_transfer) && (
                                                    <small className="text-mute d-block mt-2">
                                                        File dipilih: {data.bukti_transfer?.name || "(Tidak ada file)"}
                                                    </small>
                                                )}
                                                {(selectedData?.bukti_transfer === data.bukti_transfer) && (
                                                    <small className="text-mute d-block mt-2">
                                                        File tidak bisa sama dengan yang sebelumnnya
                                                    </small>
                                                )}
                                            </div>
                                        )}

                                        <button type="submit" className="btn btn-primary ms-auto mt-auto">
                                            <i className="fas fa-save me-2"></i>
                                            Simpan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function DetailTagihan({ selectedData, detailShow, onClose }) {
    if (!detailShow || !selectedData) return null

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)"
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose()
                }}
            >
                <div
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-header bg-success text-white">
                            <h5 className="modal-title text-white">Detail Kartu Keluarga</h5>
                        </div>
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex tambah-body flex-column" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                                <div className="p-3">
                                    <div className="kk-info-item">
                                        <p><strong>Tagihan</strong>: {selectedData.nama}</p>
                                        <p><strong>Nominal</strong>: {formatRupiah(selectedData.nominal)}</p>
                                        <p><strong>Tanggal Tagih</strong>: {formatTanggal(selectedData.tgl_tagih)}</p>
                                        <p><strong>Tanggal Tempo</strong>: {formatTanggal(selectedData.tgl_tempo)}</p>
                                        <p><strong>Jenis Tagihan</strong>: {selectedData.jenis === 'manual' ? (
                                            <span className="badge bg-primary d-flex align-items-center justify-content-center text-white ms-1">Manual</span>
                                        ) : (
                                            <span className="badge bg-secondary d-flex align-items-center justify-content-center text-white ms-1">Otomatis</span>
                                        )}
                                        </p>
                                    </div>
                                    <div className="kk-info-item">
                                        <p><strong>Status</strong>: {selectedData.status_bayar === 'sudah_bayar' ? (
                                            <span className="badge bg-success d-flex align-items-center justify-content-center text-white ms-1">Sudah Bayar</span>
                                        ) : (
                                            <span className="badge bg-danger d-flex align-items-center justify-content-center text-white ms-1">Belum Bayar</span>
                                        )}</p>
                                        {selectedData.status_bayar === 'sudah_bayar' && (
                                            <>
                                                <p><strong>Tanggal Bayar</strong>: {formatTanggal(selectedData.tgl_bayar)}</p>
                                                <p><strong>Kategori Pembayaran</strong>: {selectedData.kategori_pembayaran}</p>
                                            </>
                                        )}
                                    </div>

                                    <div className="mb-3 mt-3">
                                        {(selectedData.bukti_transfer && selectedData.status_bayar === 'sudah_bayar') && (
                                            <>
                                                <p><strong>Bukti Transfer: </strong></p>
                                                <div
                                                    className="flex-fill border-end bg-black d-flex align-items-center justify-content-center mb-3"
                                                    style={{
                                                        width: "200px",
                                                        height: "200px",
                                                        overflow: "hidden",
                                                        borderRadius: "10px",
                                                        position: "relative",
                                                    }}>
                                                    <div id="preview" style={{ width: "100%", height: "100%" }}>
                                                        {(selectedData.bukti_transfer && /\.(jpg|jpeg|png|gif)$/i.test(selectedData.bukti_transfer)) && (
                                                            <img
                                                                src={getFileUrl(selectedData.bukti_transfer)}
                                                                alt="Preview"
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "100%",
                                                                    objectFit: "contain"
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button onClick={() => onClose()} className="btn btn-success ms-auto mt-auto">
                                        <i className="fa-regular fa-circle-check me-2"></i>
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// export function TambahTransaksi({ tambahShow, onClose, onAdded, role, daftarRT = [] }) {
//     const { data, setData } = useForm({
//         tanggal: "",
//         nama_transaksi: "",
//         jenis: "",
//         nominal: "",
//         keterangan: "",
//         rt: "",
//     });

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         const formData = new FormData();
//         formData.append('tanggal', data.tanggal);
//         formData.append('nama_transaksi', data.nama_transaksi);
//         formData.append('jenis', data.jenis);
//         formData.append('nominal', data.nominal);
//         formData.append('keterangan', data.keterangan);
//         formData.append('rt', data.rt);

//         axios.post(`/${role}/transaksi`, formData)
//             .then(res => {
//                 console.log('RESPON:', res.data);

//                 if (onAdded && res.data.transaksi) {
//                     onAdded(res.data.transaksi, res.data.jenis);
//                 }

//                 setData({
//                     tanggal: "",
//                     nama_transaksi: "",
//                     jenis: "",
//                     nominal: "",
//                     keterangan: "",
//                     rt: "",
//                 });

//                 onClose();
//             })
//             .catch(err => {
//                 console.error(err.response?.data || err.message);
//             });
//     };

//     useEffect(() => {
//         const handleEsc = (e) => {
//             if (e.key === "Escape") onClose();
//         };
//         document.addEventListener("keydown", handleEsc);
//         return () => document.removeEventListener("keydown", handleEsc);
//     }, [onClose]);

//     if (!tambahShow) return null;

//     return (
//         <div
//             className="modal fade show"
//             tabIndex="-1"
//             style={{
//                 display: "block",
//                 backgroundColor: "rgba(0,0,0,0.5)"
//             }}
//             onClick={onClose}
//         >
//             <div
//                 className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
//                 onClick={(e) => e.stopPropagation()}
//             >
//                 <div className="modal-content shadow-lg border-0">
//                     <div className="modal-body p-0 m-0">
//                         <div className="d-flex tambah-body flex-column" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
//                             <div className="p-3">
//                                 <form onSubmit={handleSubmit} className="h-100">
//                                     <div className="mb-3">
//                                         <label className="form-label">Nama Transaksi</label>
//                                         <input
//                                             name="nama_transaksi"
//                                             type="text"
//                                             className="form-control"
//                                             onChange={(e) => setData('nama_transaksi', e.target.value)}
//                                             required
//                                         />
//                                     </div>

//                                     <div className="mb-3">
//                                         <label className="form-label">Tanggal Transaksi</label>
//                                         <input
//                                             name="tanggal"
//                                             type="date"
//                                             className="form-control"
//                                             onChange={(e) => setData('tanggal', e.target.value)}
//                                             required
//                                         />
//                                     </div>

//                                     <div className="mb-3">
//                                         <label className="form-label">Jenis Transaksi</label>
//                                         <select
//                                             name="jenis"
//                                             className="form-select"
//                                             value={data.jenis}
//                                             onChange={(e) => setData('jenis', e.target.value)}
//                                             required
//                                         >
//                                             <option value="">-- Pilih Jenis --</option>
//                                             <option value="pemasukan">Pemasukan</option>
//                                             <option value="pengeluaran">Pengeluaran</option>
//                                         </select>
//                                     </div>

//                                     <div className="mb-3">
//                                         <label className="form-label">Nominal Transaksi</label>
//                                         <input
//                                             type="number"
//                                             name="nominal"
//                                             className="form-control"
//                                             onChange={(e) => setData('nominal', e.target.value)}
//                                             maxLength="8"
//                                             required
//                                         />
//                                     </div>

//                                     <div className="mb-3">
//                                         <label className="form-label">RT</label>
//                                         <select
//                                             name="rt"
//                                             className="form-select"
//                                             value={data.rt}
//                                             onChange={(e) => setData('rt', e.target.value)}
//                                             required
//                                         >
//                                             <option value="">-- Pilih RT --</option>
//                                             {daftarRT.map((nomor, i) => (
//                                                 <option key={i} value={nomor}>
//                                                     RT {nomor}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div className="mb-3">
//                                         <label className="form-label">Keterangan</label>
//                                         <textarea
//                                             name="keterangan"
//                                             className="form-control"
//                                             rows="3"
//                                             onChange={(e) => setData("keterangan", e.target.value)}
//                                         ></textarea>
//                                     </div>

//                                     <button type="submit" className="btn btn-primary ms-auto mt-auto">
//                                         <i className="fas fa-save me-2"></i>
//                                         Simpan
//                                     </button>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

export function TambahTransaksiPerKk({ listKK = [], tambahShow, onClose, onAdded, role, daftarRT = [], daftarRW = [] }) {
    const { data, setData } = useForm({
        tanggal: "",
        nama_transaksi: "",
        nominal: "",
        keterangan: "",
        jenis: "pemasukan",
        no_kk: "",
        rt: "",
        rw: "",
    })
    const [Kklist, setKkList] = useState(listKK || [])
    const [rtList, setRtList] = useState([])

    const handleSelectChange = (name, selected) => {
        setData({
            ...data,
            [name]: selected?.value || ""
        });
    };

    useEffect(() => {
        let filteredRt

        if (data.rw) {
            filteredRt = daftarRT?.filter(
                // ini filter pake nomor_rw🔥😮😱🦅
                kk => kk.rw.nomor_rw == data.rw
            )
        } else {
            filteredRt = daftarRT
        }

        if (role !== 'rw' && !data.rw) {
            setRtList([])
        } else {
            setRtList(filteredRt)
        }

        if (filteredRt?.length === 0) {
            setData('rt', '')
        }
    }, [data.rw])

    const handleSubmit = (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('tanggal', data.tanggal)
        formData.append('nama_transaksi', data.nama_transaksi)
        formData.append('nominal', data.nominal)
        formData.append('keterangan', data.keterangan)
        formData.append('jenis', data.jenis)
        formData.append('no_kk', data.no_kk)
        formData.append('rt', data.rt)
        formData.append('rw', data.rw)

        axios.post(`/${role}/transaksi`, formData)
            .then(res => {
                console.log('RESPON:', res.data)

                if (onAdded && res.data.transaksi) {
                    onAdded(res.data.transaksi)
                }
                setData({
                    tanggal: "",
                    nama_transaksi: "",
                    nominal: "",
                    keterangan: "",
                    jenis: "pemasukan",
                    no_kk: "",
                    rt: "",
                    rw: "",
                })
                onClose()
            })
            .catch(err => {
                console.log('ERROR 422:', err.response.data)
            })
    }

    useEffect(() => {
        let filteredKK

        if (data.rt) {
            filteredKK = listKK?.filter(
                kk => kk.rukun_tetangga?.nomor_rt == data.rt
            )
        } else {
            filteredKK = listKK
        }

        if (role !== 'rt' && !data.rt) {
            setKkList([])
        } else {
            setKkList(filteredKK)
        }

        if (filteredKK?.length === 0) {
            setData('no_kk', '')
        }
    }, [data.rt])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

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
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex tambah-body flex-column" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                                <div className="p-3">
                                    <form onSubmit={handleSubmit} className="h-100" id="transaksi">
                                        <Role role={['admin']}>
                                            <div className="mb-3">
                                                <label className="form-label">RW</label>
                                                <Select
                                                    options={daftarRW?.map((item) => ({
                                                        value: item.nomor_rw,
                                                        label: `RW ${item.nomor_rw}`,
                                                    }))}
                                                    value={
                                                        data.rw
                                                            ? {
                                                                value: data.rw,
                                                                label: `RW ${daftarRW?.find((x) => x.nomor_rw == data.rw)?.nomor_rw}` || "",
                                                            }
                                                            : null
                                                    }
                                                    onChange={(selected) => handleSelectChange('rw', selected)}
                                                    placeholder="Pilih nomor RW..."
                                                    isSearchable={true}
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    noOptionsMessage={() => "Tidak ada RW yang aktif"}
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            border: 0,
                                                            borderBottom: "1px solid lightgray",
                                                            borderRadius: 0,
                                                            boxShadow: "none",
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        </Role>

                                        <Role role={['rw', 'bendahara', 'admin']}>
                                            <div className="mb-3">
                                                <label className="form-label">RT</label>
                                                <Select
                                                    options={rtList?.map((item) => ({
                                                        value: item.nomor_rt,
                                                        label: `RT ${item.nomor_rt}`,
                                                    }))}
                                                    value={
                                                        data.rt
                                                            ? {
                                                                value: data.rt,
                                                                label: `RT ${rtList?.find((x) => x.nomor_rt == data.rt)?.nomor_rt}` || "",
                                                            }
                                                            : null
                                                    }
                                                    onChange={(selected) => handleSelectChange('rt', selected)}
                                                    placeholder="Pilih nomor RT..."
                                                    isSearchable={true}
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    noOptionsMessage={() => data.rw ? "Tidak ada RT yang aktif" : "Harap pilih RW terlebihdahulu"}
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            border: 0,
                                                            borderBottom: "1px solid lightgray",
                                                            borderRadius: 0,
                                                            boxShadow: "none",
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        </Role>

                                        <div className="mb-3">
                                            <label className="form-label">Nomor Kartu Keluarga</label>
                                            <Select
                                                options={
                                                    Kklist?.length ? [
                                                        { value: "semua", label: "Semua Kartu Keluarga" },
                                                        ...Kklist.map((kk) => ({
                                                            value: kk.no_kk,
                                                            label: kk.no_kk,
                                                        })),
                                                    ] : []
                                                }
                                                value={
                                                    data.no_kk
                                                        ? { value: data.no_kk, label: data.no_kk === "semua" ? "Semua Kartu Keluarga" : data.no_kk }
                                                        : null
                                                }
                                                onChange={(selected) => setData("no_kk", selected?.value || "")}
                                                placeholder="Pilih atau ketik nomor KK..."
                                                isSearchable={true}
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                noOptionsMessage={() => data.rt ? "Tidak ada Kartu Keluarga yang terdaftar di RT ini" : "Harap pilih RT terlebih dahulu"}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        border: 0,
                                                        borderBottom: "1px solid lightgray",
                                                        borderRadius: 0,
                                                        boxShadow: "none",
                                                    }),
                                                }}
                                            />
                                            {/* <select
                                                name="nama_transaksi"
                                                type="text"
                                                className="tambah-judul form-control"
                                                onChange={(kk) => setData('no_kk', kk.target.value)}
                                                required
                                                style={{
                                                    border: '0',
                                                    borderBottom: '1px solid lightgray',
                                                    borderRadius: '0',
                                                }}
                                            >
                                                <option value="" selected disabled>Pilih No. KK</option>
                                                {Kklist.map((kk) => (
                                                    <option value={kk.no_kk} key={kk.id}>{kk.no_kk}{console.log(kk)}</option>
                                                ))}
                                            </select> */}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Nama Transaksi</label>
                                            <input
                                                name="nama_transaksi"
                                                type="text"
                                                className="tambah-judul form-control"
                                                onChange={(huruf) => setData('nama_transaksi', huruf.target.value)}
                                                required
                                            />
                                        </div>

                                        <Role role={['rw', 'bendahara', 'admin']}>
                                            <div className="mb-3">
                                                <label className="form-label">Jenis Transaksi</label>
                                                <select
                                                    name="jenis_transksi"
                                                    type="text"
                                                    className="form-control"
                                                    onChange={(j) => setData('jenis', j.target.value)}
                                                    required
                                                    style={{
                                                        border: '0',
                                                        borderBottom: '1px solid lightgray',
                                                        borderRadius: '0',
                                                    }}
                                                >
                                                    <option value="pemasukan" selected>Pemasukkan</option>
                                                    <option value="pengeluaran">Pengeluaran</option>
                                                </select>
                                            </div>
                                        </Role>

                                        <div className="mb-3">
                                            <label className="form-label">Tanggal Transaksi</label>
                                            <input
                                                name="tanggal"
                                                type="date"
                                                className="tambah-kategori form-control"
                                                onChange={(tanggal) => setData('tanggal', tanggal.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Nominal Transaksi</label>
                                            <input
                                                type="text"
                                                name="nominal"
                                                className="tambah-judul form-control"
                                                onChange={(nominal) => setData('nominal', nominal.target.value)}
                                                onInput={(e) => {
                                                    if (e.target.value.length > 13) {
                                                        e.target.value = e.target.value.slice(0, 13);
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Keterangan</label>
                                            <textarea
                                                name="keterangan"
                                                className="edit-isi form-control"
                                                rows="3"
                                                onChange={(e) => setData("keterangan", e.target.value)}
                                            ></textarea>
                                        </div>

                                        {/* <button type="submit" className="btn btn-primary ms-auto mt-auto">
                                            <i className="fas fa-save me-2"></i>
                                            Simpan
                                        </button> */}
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top mt-0" style={{ position: "sticky", zIndex: '10' }}>
                            <button type="submit" form="transaksi" className="btn btn-primary" style={{ width: "25%" }}>
                                <i className="fas fa-save me-2"></i> Simpan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function PilihTransaksi({ show, togglePilih, onClose }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    if (!show) return null

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
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0" style={{ height: '25%' }}>
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex tambah-body flex-column h-100" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                                <div className="d-flex row justify-content-center align-items-center p-3 h-100">
                                    <button type="button"
                                        onClick={() => {
                                            togglePilih('perKk')
                                            onClose()
                                        }}
                                        className="btn btn-primary transaksi my-2 mx-1 w-100"
                                        style={{
                                            background: 'transparent',
                                            color: 'darkgray',
                                            border: '1px solid lightgray',
                                            height: '2.5rem'
                                        }}
                                    >
                                        <i className="far fa-user me-2"></i>
                                        Transaksi Warga
                                    </button>
                                    <button type="button"
                                        onClick={() => {
                                            togglePilih('')
                                            onClose()
                                        }}
                                        className="btn btn-primary transaksi my-2 mx-1 w-100"
                                        style={{
                                            background: 'transparent',
                                            color: 'darkgray',
                                            border: '1px solid lightgray',
                                            height: '2.5rem'
                                        }}
                                    >
                                        <i className="far fa-envelope me-2"></i>
                                        Transaksi Umum
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export function EditTransaksi({ editShow, onClose, onUpdated, role, selectedData }) {
    const { data, setData } = useForm({
        tanggal: "",
        nama_transaksi: "",
        nominal: "",
        keterangan: "",
    })

    useEffect(() => {
        if (selectedData) {
            setData({
                tanggal: selectedData.tanggal || "",
                nama_transaksi: selectedData.nama_transaksi || "",
                nominal: selectedData.nominal || "",
                keterangan: selectedData.keterangan || "",
            });
        }
    }, [selectedData, setData, editShow]);

    const handleSubmit = (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('tanggal', data.tanggal)
        formData.append('nama_transaksi', data.nama_transaksi)
        formData.append('nominal', data.nominal)
        formData.append('keterangan', data.keterangan)

        axios.post(`/${role}/transaksi/${selectedData.id}`, formData)
            .then((res) => {
                if (onUpdated) onUpdated(res.data.transaksi, res.data.jenis)
                setData({
                    tanggal: "",
                    nama_transaksi: "",
                    nominal: "",
                    keterangan: "",
                })
                onClose()
            })
            .catch((err) => {
                console.error(err.response?.data || err)
                alert("Gagal update tagihan! Lihat console untuk detail.")
            })
    }

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") onClose()
        }

        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [onClose])

    if (!editShow) return null

    return (
        <>
            <div
                className="modal fade show"
                tabIndex="-1"
                style={{
                    display: "block",
                    backgroundColor: "rgba(0,0,0,0.5)"
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose()
                }}
            >
                <div
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content shadow-lg border-0">
                        <div className="modal-body p-0 m-0">
                            <div className="d-flex tambah-body flex-column" style={{ width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
                                <div className="p-3">
                                    <form onSubmit={handleSubmit} className="h-100">
                                        <div className="mb-3">
                                            <label className="form-label">Nama Transaksi</label>
                                            <input
                                                name="nama_transaksi"
                                                type="text"
                                                value={data.nama_transaksi}
                                                className="tambah-judul form-control"
                                                onChange={(huruf) => setData('nama_transaksi', huruf.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tanggal bayar</label>
                                            <input
                                                name="tanggal"
                                                type="date"
                                                value={data.tanggal ? data.tanggal.split('T')[0] : ''}
                                                className="tambah-kategori form-control"
                                                onChange={(e) => setData('tanggal', e.target.value)}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Nominal Transaksi</label>
                                            <input
                                                type="text"
                                                name="nominal"
                                                value={data.nominal}
                                                className="tambah-judul form-control"
                                                onChange={(nominal) => setData('nominal', nominal.target.value)}
                                                onInput={(e) => {
                                                    if (e.target.value.length > 13) {
                                                        e.target.value = e.target.value.slice(0, 13);
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Keterangan</label>
                                            <textarea
                                                name="keterangan"
                                                className="edit-isi form-control"
                                                value={data.keterangan}
                                                rows="3"
                                                onChange={(e) => setData("keterangan", e.target.value)}
                                            ></textarea>
                                        </div>

                                        <button type="submit" className="btn btn-primary ms-auto mt-auto">
                                            <i className="fas fa-save me-2"></i>
                                            Simpan
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}