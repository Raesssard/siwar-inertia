import React, { useEffect, useRef } from "react";
import axios from "axios";

export default function RoleCookieToast({ user }) {
    const toastRef = useRef(null);

    useEffect(() => {
        const toast = new bootstrap.Toast(toastRef.current, {
            autohide: false
        });
        toast.show();
    }, []);

    const saveCookie = () => {
        axios.post("/request-cookie")
            .then(() => {
                bootstrap.Toast.getInstance(toastRef.current).hide();
            })
            .catch(err => console.error(err));
    };

    const hide = () => {
        bootstrap.Toast.getInstance(toastRef.current).hide();
    };

    return (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
            <div className="toast" ref={toastRef}>
                <div className="toast-header">
                    <strong className="me-auto">Mau kue?</strong>
                    <button className="btn-close" onClick={hide}></button>
                </div>

                <div className="toast-body">
                    <strong>{user?.nama}</strong>, Anda tidak memilih untuk diingat diawal saat login.<br />
                    Jadi... mau kue ini? biar mudah diingat oleh kita.

                    <div className="mt-3 d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-secondary" onClick={hide}>
                            Lewati
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={saveCookie}>
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
