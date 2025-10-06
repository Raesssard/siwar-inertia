import React, { useState } from "react"
import { usePage, Link } from "@inertiajs/react"
import { Inertia } from "@inertiajs/inertia"
import "../../css/topbar.css"
import { PasswordModal } from "../Pages/Component/Modal"

export default function Topbar({ modalShow }) {
    const { props } = usePage()
    const user = props.auth?.user
    const currentRole = props.auth?.currentRole
    const roles = props.auth?.roles || []
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [gantiAkun, setGantiAkun] = useState(false)
    const [selectedRole, setSelectedRole] = useState("")

    const modalHandler = (showModal) => setShowPasswordModal(showModal)

    function submit(e) {
        e.preventDefault()
        if (selectedRole) {
            Inertia.post("/choose-role", { role: selectedRole })
        }
    }

    function accountChange(e) {
        e.preventDefault()
        e.stopPropagation()
        setGantiAkun(!gantiAkun)
    }

    const url = window.location.pathname
    const segment = url.split("/").pop()

    let judulHalaman
    if (!segment && (url === "/" || url === "/dashboard-main")) {
        judulHalaman = "Dashboard"
    } else {
        switch (segment) {
            case "kk":
                judulHalaman = "Data Kartu Keluarga"
                break
            case "warga":
                judulHalaman = "Dashboard"
                break
            case "pengumuman":
                judulHalaman = "Pengumuman"
                break
            case "tagihan":
                judulHalaman = "Tagihan Saya"
                break
            case "iuran":
                judulHalaman = "Iuran"
                break
            case "transaksi":
                judulHalaman = "Transaksi"
                break
            case "pengaduan":
                judulHalaman = "Pengaduan Saya"
                break
            default:
                judulHalaman =
                    segment.charAt(0).toUpperCase() +
                    segment.slice(1).replace(/-/g, " ")
        }
    }

    return (
        <nav className="navbar nav-top navbar-expand navbar-light bg-white topbar mb-4 sticky-top shadow">
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
                        <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            <i className="fas fa-lock fa-sm fa-fw mr-2 text-gray-400"></i>
                            Ubah Password
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
                                                    onClick={() => setSelectedRole(rol)}
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
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="dropdown-item"
                        >
                            <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>{" "}
                            Logout
                        </Link>
                    </div>
                </li>
            </ul>

            {/* Modal password */}
            {showPasswordModal && <PasswordModal show={modalHandler} />}
        </nav>
    )
}
