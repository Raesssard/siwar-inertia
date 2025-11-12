import React, { useState } from "react"
import "../../css/login.css"
import { Head, useForm } from "@inertiajs/react"
import Swal from "sweetalert2"
import axios from "axios"
import FloatingInput from './Component/FloatingInput'
import logo from '../../../public/img/logo.png'

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        nik: '',
        password: '',
    })

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("/login", data);

            if (res.data?.choose_role) {
                const roles = res.data.roles;

                const htmlButtons = roles
                    .map(
                        (role) => `
                    <button class="swal2-confirm swal2-styled" 
                        style="margin: 5px; background-color:#3085d6; width:100px;" 
                        data-role="${role}">
                        ${role.length <= 2 ? role.toUpperCase() : role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                `
                    )
                    .join("");

                await Swal.fire({
                    title: "Pilih Role untuk Login",
                    html: `
                    <p>Akun ini memiliki lebih dari satu role.</p>
                    <div style="display:flex;flex-wrap:wrap;justify-content:center;">
                        ${htmlButtons}
                    </div>
                `,
                    showConfirmButton: false,
                    showCancelButton: false,
                    didOpen: () => {
                        const buttons = Swal.getHtmlContainer().querySelectorAll("button[data-role]");
                        buttons.forEach((btn) => {
                            btn.addEventListener("click", async (e) => {
                                const chosenRole = e.target.getAttribute("data-role");
                                Swal.close(); // tutup popup dulu
                                await axios.post("/choose-role", { role: chosenRole });
                                window.location.href = "/dashboard";
                            });
                        });
                    },
                });
            } else {
                window.location.href = "/dashboard";
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Gagal", "Terjadi kesalahan saat login.", "error");
        }
    };

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

                            {(errors?.nik || errors?.password) &&
                                (<div className="alert mt-2">
                                    NIK atau kata sandi salah.
                                    <button type="button" className="custom-close" onClick={(e) => e.target.parentElement.remove()}>
                                        ×
                                    </button>
                                </div>)
                            }


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
