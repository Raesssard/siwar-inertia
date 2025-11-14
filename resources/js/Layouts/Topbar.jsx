import React, { useState } from "react"
import { usePage, Link } from "@inertiajs/react"
import { Inertia } from "@inertiajs/inertia"
import "../../css/topbar.css"
// import { PasswordModal } from "../Pages/Component/Modal"
import Swal from "sweetalert2"
import { router } from '@inertiajs/react'
import { route } from "ziggy-js"

export default function Topbar({ modalShow, hapusHistory }) {
    const { props } = usePage()
    const user = props.auth?.user
    const currentRole = props.auth?.currentRole
    const roles = props.auth?.rolesAccount || []
    // const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [gantiAkun, setGantiAkun] = useState(false)
    const [selectedRole, setSelectedRole] = useState("")
    function getNameFromUrl(url) {
        return url.split("/").pop();
    }
    const isSettingsPage = getNameFromUrl(usePage().url) === "settings"
    // const modalHandler = (showModal) => setShowPasswordModal(showModal)

    function submit(e) {
        e.preventDefault()
        if (selectedRole) {
            Inertia.post("/choose-role", { role: selectedRole })
        }
    }

    const handleLogout = () => {
        Swal.fire({
            title: "Yakin logout dari akun ini?",
            text: "Anda akan diarahkan ke halaman login.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, logout",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Sedang logout...",
                    text: "Mohon tunggu sebentar.",
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading()
                    }
                })

                router.post(route('logout'), {}, {
                    onSuccess: () => {
                        Swal.close()
                        Inertia.visit(route('login'))
                    },
                    onError: (error) => {
                        Swal.fire({
                            icon: "error",
                            title: "Gagal logout!",
                            text: "Terjadi kesalahan saat logout. Silakan coba lagi.",
                        })
                        console.error("Error during logout:", error)
                    }
                })
            }
        })
    }


    function accountChange(e) {
        e.preventDefault()
        e.stopPropagation()
        setGantiAkun(!gantiAkun)
    }

    const handleChangeRole = (e, rol) => {
        e.preventDefault();
        setSelectedRole(rol);
        hapusHistory();

        Swal.fire({
            title: "Mengganti akun...",
            text: `Sedang masuk sebagai ${rol.length <= 2 ? rol.toUpperCase() : rol.charAt(0).toUpperCase() + rol.slice(1)}...`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        // Kirim form ganti role
        axios.post("/choose-role", { role: rol })
            .then(() => {
                window.location.href = "/dashboard";
            })
            .catch(() => {
                Swal.fire("Gagal", "Terjadi kesalahan saat mengganti akun.", "error");
            });
    }

    const url = window.location.pathname
    const segment = url.split("/").pop()

    let judulHalaman

    if (currentRole === 'warga') {
        if (!segment && (url === "/" || url === "/dashboard-main")) {
            judulHalaman = "Dashboard"
        } else {
            switch (segment) {
                case "kk":
                    judulHalaman = "Data Kartu Keluarga"
                    break
                case "dashboard":
                    judulHalaman = "Dashboard"
                    break
                case "pengumuman":
                    judulHalaman = "Pengumuman"
                    break
                case "tagihan":
                    judulHalaman = "Tagihan"
                    break
                case "iuran":
                    judulHalaman = "Iuran"
                    break
                case "transaksi":
                    judulHalaman = "Transaksi"
                    break
                case "pengaduan":
                    judulHalaman = "Pengaduan"
                    break
                default:
                    judulHalaman =
                        segment.charAt(0).toUpperCase() +
                        segment.slice(1).replace(/-/g, " ")
            }
        }
    }

    if (currentRole === 'rt') {
        if (!segment && (url === "/" || url === "/dashboard-main")) {
            judulHalaman = "Dashboard"
        } else {
            switch (segment) {
                case "kartu_keluarga":
                    judulHalaman = "Data Kartu Keluarga"
                    break
                case "dashboard":
                    judulHalaman = "Dashboard"
                    break
                case "pengumuman":
                    judulHalaman = "Pengumuman"
                    break
                case "tagihan":
                    judulHalaman = "Tagihan"
                    break
                case "iuran":
                    judulHalaman = "Iuran"
                    break
                case "transaksi":
                    judulHalaman = "Transaksi"
                    break
                case "pengaduan":
                    judulHalaman = "Pengaduan"
                    break
                case "warga":
                    judulHalaman = "Analisis Warga"
                    break
                case "keuangan":
                    judulHalaman = "Analisis Keuangan"
                    break
                default:
                    judulHalaman =
                        segment.charAt(0).toUpperCase() +
                        segment.slice(1).replace(/-/g, " ")
            }
        }
    }

    if (currentRole === 'rw') {
        if (!segment && (url === "/" || url === "/dashboard-main")) {
            judulHalaman = "Dashboard"
        } else {
            switch (segment) {
                case "rt":
                    judulHalaman = "Rukun Tetangga"
                    break
                case "kartu_keluarga":
                    judulHalaman = "Data Kartu Keluarga"
                    break
                case "dashboard":
                    judulHalaman = "Dashboard"
                    break
                case "pengumuman":
                    judulHalaman = "Pengumuman"
                    break
                case "tagihan":
                    judulHalaman = "Tagihan Warga"
                    break
                case "iuran":
                    judulHalaman = "Iuran Warga"
                    break
                case "transaksi":
                    judulHalaman = "Transaksi RW"
                    break
                case "pengaduan":
                    judulHalaman = "Pengaduan"
                    break
                case "warga":
                    judulHalaman = "Analisis Warga"
                    break
                case "keuangan":
                    judulHalaman = "Analisis Keuangan"
                    break
                default:
                    judulHalaman =
                        segment.charAt(0).toUpperCase() +
                        segment.slice(1).replace(/-/g, " ")
            }
        }
    }

    if (currentRole === 'admin') {
        if (!segment && (url === "/" || url === "/dashboard-main")) {
            judulHalaman = "Dashboard"
        } else {
            switch (segment) {
                case "rw":
                    judulHalaman = "Rukun Warga"
                    break
                case "dashboard":
                    judulHalaman = "Dashboard"
                    break
                case "rt":
                    judulHalaman = "Rukun Tetangga"
                    break
                case "kategori-golongan":
                    judulHalaman = "Kategori Golongan"
                    break
                case "roles":
                    judulHalaman = "Roles"
                    break
                case "permissions":
                    judulHalaman = "Permissions"
                    break
                default:
                    judulHalaman =
                        segment.charAt(0).toUpperCase() +
                        segment.slice(1).replace(/-/g, " ")
            }
        }
    }

    return (
        <nav className="navbar nav-top navbar-expand navbar-light bg-white topbar mb-3 sticky-top shadow">
            {/* tombol sidebar mobile */}
            <button
                className="btn btn-link d-md-none rounded-circle mr-3"
                onClick={() => modalShow(true)}
            >
                <i className="fa fa-bars"></i>
            </button>

            <h1 className="h3 mb-0 text-gray-800 mx-2 text-truncate">
                {judulHalaman}
            </h1>

            <ul className="navbar-nav ml-auto">
                <li className="nav-item dropdown no-arrow">
                    <Link
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="userDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <span className="mr-3 text-gray-600 small user-name-display">
                            {user?.nama || "User"}
                        </span>
                    </Link>

                    <div
                        className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                        aria-labelledby="userDropdown"
                        data-bs-auto-close="outside"
                    >
                        {/* Ubah password */}
                        <button className="dropdown-item"
                            disabled={isSettingsPage}
                            type="button"
                            onClick={() => {
                                // setShowPasswordModal(true)
                                router.visit(route('settings'), {
                                    preserveScroll: true,
                                })
                            }}
                        >
                            <i className="fas fa-cog fa-sm fa-fw mr-2 text-gray-400"></i>
                            Pengaturan
                        </button>

                        {/* Ganti akun */}
                        {roles.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className={`btn-account dropdown-item ${gantiAkun ? 'active' : ''}`}
                                    onClick={accountChange}
                                >
                                    <i className="fas fa-users-cog fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Ganti akun
                                </button>
                                {gantiAkun && (
                                    <div className={`akun-dropdown ${gantiAkun ? "show" : ""}`}>
                                        <div className="dropdown-divider"></div>
                                        {roles.map((rol, index) => (
                                            <form key={index} onSubmit={submit}>
                                                <input type="hidden" name="role" value={rol} />
                                                <button
                                                    type="submit"
                                                    className={`btn-account dropdown-item ${currentRole === rol ? 'active' : ''}`}
                                                    onClick={(e) => handleChangeRole(e, rol)}
                                                    disabled={currentRole === rol}
                                                >
                                                    <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                                                    {`Akun ${rol.length <= 2
                                                        ? rol.toUpperCase()
                                                        : rol.charAt(0).toUpperCase() +
                                                        rol.slice(1)
                                                        }`}
                                                </button>
                                            </form>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        <div className="dropdown-divider"></div>

                        {/* Tombol logout */}
                        <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => {
                                hapusHistory()
                                handleLogout()
                            }}
                        >
                            <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>{" "}
                            Logout
                        </button>
                    </div>
                </li>
            </ul>

            {/* Modal password; gk kepake soalnya ada di settings */}
            {/* {showPasswordModal && <PasswordModal show={modalHandler} />} */}
        </nav>
    )
}
