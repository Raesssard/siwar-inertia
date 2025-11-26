import React, { useEffect, useRef } from "react"
import axios from "axios"

export default function RoleCookieToast({ user }) {
    const toastRef = useRef(null)

    useEffect(() => {
        const toast = new bootstrap.Toast(toastRef.current, {
            autohide: false
        })
        toast.show()
    }, [])

    const saveCookie = () => {
        axios.post("/request-cookie")
            .then(() => {
                bootstrap.Toast.getInstance(toastRef.current).hide()
            })
            .catch(err => console.error(err))
    }

    const hide = () => {
        axios.post("/reject-cookie")
            .then(() => {
                bootstrap.Toast.getInstance(toastRef.current).hide()
            })
            .catch(err => console.error(err))
    }

    return (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
            <div className="toast" ref={toastRef}>
                <div className="toast-header">
                    <strong className="me-auto">Mau kue?</strong>
                    <button className="btn-close" onClick={hide}></button>
                </div>

                <div className="toast-body d-flex align-items-center gap-3 py-1">
                    <i
                        className="fa-solid fa-cookie-bite"
                        style={{
                            position: 'relative',
                            fontSize: '48px',
                            top: '15px',
                            opacity: '0.75'
                        }}
                    ></i>

                    <div>
                        <p className="mb-0" style={{fontSize: '0.8rem'}}>
                            <strong>{user?.nama}</strong>, Anda tidak memilih untuk diingat saat login.<br />
                            Jadi... mau kue ini? biar mudah diingat oleh kita.
                        </p>
                    </div>
                </div>

                <div className="d-flex justify-content-end gap-2 me-2">
                    <button className="btn btn-sm btn-secondary mt-0" onClick={hide}>
                        Tidak, terima kasih
                    </button>
                    <button className="btn btn-sm btn-primary mt-0" onClick={saveCookie}>
                        Terima
                    </button>
                </div>
            </div>
        </div>
    )
}
