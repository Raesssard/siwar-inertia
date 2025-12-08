import React, { useState } from "react"
import { Inertia } from "@inertiajs/inertia"
import { Head } from "@inertiajs/react"
import '../../css/choose-role.css'

// dah gk kepake lagi btw

export default function ChooseRole({ roles }) {
    const [selectedRole, setSelectedRole] = useState("")

    function submit(e) {
        e.preventDefault()
        if (selectedRole) {
            Inertia.post('/choose-role', { role: selectedRole })
        }
    }

    return (
        <>
            <Head title="Choose Role" />
            <div
                className="container d-flex flex-column align-items-center justify-content-center"
                style={{ minHeight: "100vh" }}
            >
                <h1 className="judul mb-4"><strong>Pilih Role untuk Login</strong></h1>
                <div className="cards d-flex gap-4">
                    {roles.map((rol, index) => (
                        <div
                            key={index}
                            className="card text-center p-4"
                            style={{ width: "200px" }}
                        >
                            <h5 className="card-title">Sebagai {
                                rol.length <= 2
                                    ? rol.toUpperCase()
                                    : rol.charAt(0).toUpperCase() + rol.slice(1)
                            }
                            </h5>
                            <form onSubmit={submit}>
                                <input
                                    type="hidden"
                                    name="role"
                                    value={rol}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary mt-4 mb-1"
                                    onClick={() => setSelectedRole(rol)}
                                >
                                    Masuk
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}