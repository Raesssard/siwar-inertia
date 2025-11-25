import React, { useEffect, useState } from "react"
import { usePage, Link } from "@inertiajs/react"
import { Inertia } from "@inertiajs/inertia"
import "../../css/topbar.css"
// import { PasswordModal } from "../Pages/Component/Modal"
import Swal from "sweetalert2"
import { router } from '@inertiajs/react'
import { route } from "ziggy-js"
import { isMobile, judul } from "../Pages/Component/GetPropRole"

export default function Topbar({ modalShow, hapusHistory }) {
    const { props } = usePage()
    const user = props.auth?.user
    const currentRole = props.auth?.currentRole
    const roles = props.auth?.rolesAccount || []
    // const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [gantiAkun, setGantiAkun] = useState(false)
    const [selectedRole, setSelectedRole] = useState("")
    // const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [mobile, setMobile] = useState(isMobile);

    useEffect(() => {
        function handleResize() {
            // setIsMobile(window.innerWidth < 768)
            setMobile(isMobile);
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const widthName = mobile && '40%'

    function getNameFromUrl(url) {
        return url.split("/").pop()
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
        e.preventDefault()
        setSelectedRole(rol)
        hapusHistory()

        Swal.fire({
            title: "Mengganti akun...",
            text: `Sedang masuk sebagai ${rol.length <= 2 ? rol.toUpperCase() : rol.charAt(0).toUpperCase() + rol.slice(1)}...`,
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        })

        // Kirim form ganti role
        axios.post("/choose-role", { role: rol })
            .then(() => {
                window.location.href = "/dashboard"
            })
            .catch(() => {
                Swal.fire("Gagal", "Terjadi kesalahan saat mengganti akun.", "error")
            })
    }

    return (
        <nav className="navbar nav-top navbar-expand navbar-light bg-white topbar mb-3 sticky-top shadow">
            {/* tombol sidebar mobile */}
            <button
                className="btn btn-link d-md-none rounded-circle my-3 mr-2"
                onClick={() => modalShow(true)}
            >
                <i className="fa fa-bars"></i>
            </button>

            <h1 className={`${mobile ? 'h5 mx-0' : 'h3 mx-2'} mb-0 text-gray-800 text-truncate`}>
                {judul(currentRole)}
            </h1>

            <ul className="navbar-nav ml-auto" style={{ width: widthName }}>
                <li className="nav-item dropdown no-arrow w-100">
                    <Link
                        className="nav-link dropdown-toggle w-100"
                        href="#"
                        id="userDropdown"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                        <span className={`${mobile ? 'ms-auto' : ''} me-3 text-gray-600 small user-name-display`} style={{ maxWidth: '100%' }}>
                            {user?.nama || "User"}
                        </span>
                    </Link>

                    <div
                        className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
                        aria-labelledby="userDropdown"
                        data-bs-auto-close="outside"
                        style={{ width: 'fit-content' }}
                    >
                        <button
                            className="dropdown-item"
                            onClick={() => router.visit(route("profile"))}
                        >
                            <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                            Profil
                        </button>
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
