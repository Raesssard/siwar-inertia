import React, { useState } from "react"
import "../../css/login.css"
import { Head, useForm } from "@inertiajs/react"
import Swal from "sweetalert2"
import axios from "axios"
import FloatingInput from './Component/FloatingInput'
import logo from '../../../public/img/logo.png'

export default function Login() {
    const { data, setData, processing } = useForm({
        nik: '',
        password: '',
        remember: false,
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post("/login", data)

            if (res.data?.choose_role) {
                const roles = res.data.roles;

                const htmlButtons = roles
                    .map(
                        (role) => `
                    <button class="swal2-confirm swal2-styled" 
                        style="margin: 5px; background-color:#3085d6;width:100px;" 
                        data-role="${role}">
                        ${role.length <= 2 ? role.toUpperCase() : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                `
                    )
                    .join("")

                await Swal.fire({
                    title: "Pilih Role untuk Login",
                    icon: "info",
                    html: `
                    <small>Akun ini memiliki lebih dari satu role.</small>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;margin-top:1rem;">
                        ${htmlButtons}
                    </div>
                `,
                    showConfirmButton: false,
                    allowOutsideClick: false,
                    didOpen: () => {
                        const buttons = Swal.getHtmlContainer().querySelectorAll("button[data-role]")
                        buttons.forEach((btn) => {
                            btn.addEventListener("click", async (e) => {
                                const chosenRole = e.target.getAttribute("data-role")

                                // Ubah Swal jadi loading
                                Swal.fire({
                                    title: "Memproses...",
                                    text: `Sedang masuk sebagai ${chosenRole.length <= 2
                                        ? chosenRole.toUpperCase()
                                        : chosenRole.charAt(0).toUpperCase() + chosenRole.slice(1)
                                        }...`,
                                    allowOutsideClick: false,
                                    didOpen: () => Swal.showLoading(),
                                })

                                try {
                                    await axios.post("/choose-role", { role: chosenRole })
                                    window.location.href = "/dashboard";
                                } catch (err) {
                                    console.error(err)
                                    Swal.fire("Gagal", "Terjadi kesalahan saat memilih role.", "error")
                                }
                            })
                        })
                    },
                })
            } else {
                window.location.href = res.data?.redirect ?? '/dashboard';
            }
        } catch (err) {
            console.error(err)
            Swal.fire("Gagal", "NIK atau kata sandi salah.", "error")
        }
    }

    return (
        <>
            <Head title="Login" />
            <div className="login-container">
                <div className="login-card">
                    <div className="login-card-header">
                        <div className="login-logo">
                            <img src={logo} alt="SiWar Logo" className="login-logo-img" />
                        </div>
                        <h3>Sistem Informasi Warga</h3>
                    </div>

                    <div className="login-card-body">
                        <h3 className="form-title">Log In</h3>

                        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                            <FloatingInput
                                label="NIK"
                                value={data.nik}
                                onChange={(e) => setData('nik', e.target.value)}
                                icon="bi-person-badge"
                            />

                            <FloatingInput
                                label="Kata Sandi"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                icon="bi-lock"
                                toggleable
                            />

                            <div className="form-check mt-3 mb-3 text-start">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    style={{ backgroundColor: '#4e73df' }}
                                />
                                <label htmlFor="remember" className="form-check-label">
                                    Ingat saya
                                </label>
                            </div>

                            <button type="submit" className="btn-login btn-primary">
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                {processing ? "Proses..." : "Masuk"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
