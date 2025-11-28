import React, { useEffect, useMemo, useRef, useState } from "react"
import { useForm, Head, router, usePage } from "@inertiajs/react"
import Layout from "@/Layouts/Layout"
import Swal from "sweetalert2"

export default function ProfilePage({ user, rt, rw, kk }) {
    const { data, setData, post, processing, errors } = useForm({
        nama: user.nama,
        foto_profil: user.foto_profil || null,
    })
    const [previewUrl, setPreviewUrl] = useState(null)
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)
    const toggleMenu = () => setShowMenu(prev => !prev)
    const [fotoBase, setFotoBase] = useState(user.foto_profil)
    const [isPhotoDirty, setIsPhotoDirty] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const bypassGuard = useRef(false)

    const safeAction = async (callback) => {
        bypassGuard.current = true
        try {
            await callback()
        } finally {
            setTimeout(() => (bypassGuard.current = false), 300)
        }
    }

    useEffect(() => {
        const unsub = router.on("before", (event) => {

            if (bypassGuard.current || isSubmitting) return true

            if (!isPhotoDirty) return true

            event.preventDefault()

            Swal.fire({
                title: "Anda belum menyimpan perubahan profil. Tinggalkan halaman?",
                text: 'Harap simpan perubahan terlebih dahulu. Jika Anda meninggalkan halaman, perubahan tersebut akan hilang.',
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Ya, tinggalkan",
                cancelButtonText: "Batal",
            }).then((result) => {
                if (result.isConfirmed) {

                    const targetUrl = event.detail?.visit?.url ?? event.detail?.href
                    if (!targetUrl) return

                    bypassGuard.current = true

                    setTimeout(() => {
                        router.visit(targetUrl)
                    }, 10)
                }
            })

            return false
        })

        return unsub
    }, [isPhotoDirty, isSubmitting])

    const normalizeFoto = (value) => {
        if (value instanceof File) {
            return `profil/${value.name}`
        }

        return value ?? null
    }

    const foto_awal = useMemo(() => normalizeFoto(fotoBase), [fotoBase])
    const foto_sekarang = useMemo(() => normalizeFoto(data.foto_profil), [data.foto_profil])

    useEffect(() => {
        setIsPhotoDirty(foto_awal !== foto_sekarang)
    }, [foto_awal, foto_sekarang])

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false)
            }
        }

        document.addEventListener("click", handleClickOutside)
        return () => document.removeEventListener("click", handleClickOutside)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        bypassGuard.current = true

        post(route("profile.updatePhoto"), {
            forceFormData: true,
            onSuccess: () => {
                setFotoBase(data.foto_profil)
                setIsPhotoDirty(false)
            },
            onFinish: () => {
                setIsSubmitting(false)
                bypassGuard.current = false
            }
        })
    }

    const handleDeletePhoto = () => {
        // if (!confirm("Yakin ingin menghapus foto profil?")) return
        Swal.fire({
            title: "Yakin ingin menghapus foto profil?",
            text: 'Foto profil akan dihapus',
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                safeAction(() => {
                    return router.delete("/profile/delete-photo", {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: () => {
                            setPreviewUrl(null)
                            setData("foto_profil", null)

                            setFotoBase(null)

                            setIsPhotoDirty(false)
                        }
                    })
                })
            }
        })
    }

    useEffect(() => {
        if (!user.foto_profil) return

        const fileName = user.foto_profil.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            setPreviewUrl({ type: "image", src: user.foto_profil })
        } else {
            setPreviewUrl({ type: "other", name: user.foto_profil })
        }
    }, [])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]

        if (!selectedFile) {
            setPreviewUrl(null)
            setData("foto_profil", null)
            return
        }

        setData("foto_profil", selectedFile || null)

        const fileName = selectedFile.name.toLowerCase()

        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            const reader = new FileReader()
            reader.onload = (ev) => setPreviewUrl({ type: "image", src: ev.target.result })
            reader.readAsDataURL(selectedFile)
        } else {
            setPreviewUrl({ type: "other", name: selectedFile.name })
        }
    }

    const getFileUrl = (src) => {
        if (!src) return ""
        if (src.startsWith("data:")) return src
        if (src.startsWith("blob:")) return src
        return `/storage/${src}`
    }

    return (
        <Layout title="Profil Pengguna">
            <Head title="Profil" />

            <div className="max-w-4xl mx-auto p-8 rounded-xl shadow">
                <h2 className="mb-3">Profil Pengguna</h2>

                <div className="d-flex justify-content-center align-items-center flex-column flex-md-row gap-10">

                    {/* FOTO PROFIL */}
                    <div className="mb-auto">
                        <input
                            type="file"
                            id="foto-profil"
                            accept="image/*"
                            className="d-none"
                            onChange={handleFileChange}
                        />

                        <div style={{ position: "relative", width: "160px" }}>
                            {(user.foto_profil || previewUrl) ? (
                                <img
                                    src={getFileUrl(previewUrl?.src ?? user.foto_profil)}
                                    alt="Foto Profil"
                                    className="w-40 h-40 rounded-full object-cover border"
                                    style={{ cursor: 'pointer', width: "100%", height: "160px" }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleMenu()
                                    }}
                                />
                            ) : (
                                <div
                                    className="rounded-full d-flex justify-content-center align-items-center border"
                                    style={{
                                        width: "160px",
                                        height: "160px",
                                        backgroundColor: "#f1f5f9",
                                        cursor: "pointer"
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        toggleMenu()
                                    }}
                                >
                                    <i className="fas fa-user" style={{ fontSize: '5rem' }}></i>
                                </div>
                            )}
                            <button
                                className="btn btn-small"
                                style={{
                                    backgroundColor: '#f1f5f9',
                                    border: "1px solid lightgray",
                                    position: "absolute",
                                    bottom: "5px",
                                    left: "5px",
                                    padding: "3px 6px",
                                    borderRadius: "6px"
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleMenu()
                                }}
                            >
                                <i className="far fa-edit me-2"></i>
                                Edit
                            </button>
                            {showMenu && (
                                <div
                                    ref={menuRef}
                                    style={{
                                        position: "absolute",
                                        left: "0",
                                        bottom: "-85px",
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
                                        style={{ padding: "6px 12px", cursor: "pointer" }}
                                        onClick={() => document.getElementById('foto-profil').click()}
                                    >
                                        <i className="fas fa-images me-2"></i>
                                        Ganti Foto
                                    </button>
                                    <button
                                        className="dropdown-item"
                                        style={{
                                            padding: "6px 12px",
                                            color: "red",
                                            cursor: (!user.foto_profil && !previewUrl) ? "not-allowed" : "pointer",
                                            opacity: (!user.foto_profil && !previewUrl) ? 0.5 : 1,
                                            pointerEvents: (!user.foto_profil && !previewUrl) ? "none" : "auto"
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeletePhoto()
                                        }}
                                    >
                                        <i className="far fa-trash-alt me-2"></i>
                                        Hapus Foto
                                    </button>
                                </div>
                            )}
                        </div>


                        {errors.foto_profil && (
                            <p className="text-red-500 text-sm">
                                {errors.foto_profil}
                            </p>
                        )}
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="flex-1 space-y-4">

                        {/* NAMA */}
                        {/* <div>
                            <label className="font-medium">Nama Lengkap</label>
                            <input
                                type="text"
                                value={data.nama}
                                className="w-full border rounded p-2"
                                disabled
                            />
                            {errors.nama && (
                                <p className="text-red-500 text-sm">
                                    {errors.nama}
                                </p>
                            )}
                        </div> */}

                        {/* INFO USER */}
                        <div
                            className="p-4 rounded"
                            style={{
                                backgroundColor: '#f1f5f9',
                                border: "1px solid lightgray",
                            }}
                        >
                            <h3 className="font-semibold mb-2">Informasi User</h3>
                            <label>
                                <strong>Nama Lengkap:</strong>
                            </label>
                            <p
                                style={{
                                    width: '100%',
                                    paddingLeft: '1rem',
                                    marginBottom: '0.5rem',
                                    borderBottom: '1px solid lightgray',
                                    paddingBottom: '0.4rem'
                                }}
                            >
                                {user.nama}
                            </p>
                            <label>
                                <strong>NIK:</strong>
                            </label>
                            <p
                                style={{
                                    width: '100%',
                                    paddingLeft: '1rem',
                                    marginBottom: '0.5rem',
                                    borderBottom: '1px solid lightgray',
                                    paddingBottom: '0.4rem'
                                }}
                            >
                                {user.nik}
                            </p>
                            <label>
                                <strong>No KK:</strong>
                            </label>
                            <p
                                style={{
                                    width: '100%',
                                    paddingLeft: '1rem',
                                    marginBottom: '0.5rem',
                                    borderBottom: '1px solid lightgray',
                                    paddingBottom: '0.4rem'
                                }}
                            >
                                {kk?.no_kk ?? "-"}
                            </p>
                            <label>
                                <strong>RT/RW:</strong>
                            </label>
                            <p
                                style={{
                                    width: '100%',
                                    paddingLeft: '1rem',
                                    marginBottom: '0.5rem',
                                    borderBottom: '1px solid lightgray',
                                    paddingBottom: '0.4rem'
                                }}
                            >
                                {`${rt ? rt.nomor_rt : "-"}/${rw ? rw.nomor_rw : "-"}`}
                            </p>
                            {/* <label>
                                <strong>RW:</strong>
                            </label>
                            <p
                                style={{
                                    width: '100%',
                                    paddingLeft: '1rem',
                                    marginBottom: '0.5rem',
                                    borderBottom: '1px solid lightgray',
                                    paddingBottom: '0.4rem'
                                }}
                            >
                                {rw ? rw.nomor_rw : "-"}
                            </p> */}
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-600 text-white px-5 py-2 rounded w-100"
                        >
                            Simpan Perubahan
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    )
}
