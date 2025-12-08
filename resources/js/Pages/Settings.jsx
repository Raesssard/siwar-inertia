import React from "react";
import { useForm, usePage } from "@inertiajs/react";
import Layout from "@/Layouts/Layout";

export default function Settings() {
    const { user, settings } = usePage().props;
    const { props } = usePage()
    const role = props.auth?.currentRole

    // 🔐 Form ubah password
    const {
        data: passwordData,
        setData: setPasswordData,
        put: putPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
    } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        putPassword(route("settings.update-password"));
    };

    // ⚙️ Form pengaturan sistem
    const {
        data: settingsData,
        setData: setSettingsData,
        put: putSettings,
        processing: settingsProcessing,
        errors: settingsErrors,
    } = useForm({
        max_rt_per_rw: settings?.max_rt_per_rw || "",
    });

    const handleSettingsSubmit = (e) => {
        e.preventDefault();
        putSettings(route("settings.update-system"));
    };

    return (
        <Layout title="Pengaturan Akun & Sistem">
            <div className="col-12 col-md-10 col-lg-8 mx-auto py-5">
                <div className="bg-white shadow rounded-lg p-4">
                    <h3 className="mb-4 fw-bold text-center">
                        <i className="fas fa-cog me-2 text-primary"></i> Pengaturan Akun
                    </h3>

                    {/* Informasi Akun */}
                    <div className="border-bottom mb-4"></div>
                    <div className="mb-4">
                        <h5 className="fw-semibold mb-2 text-gray-800">
                            Informasi Akun
                        </h5>
                        <div className="mb-1">
                            <strong>Nama:</strong> {user.nama}
                        </div>
                        <div className="mb-1">
                            <strong>NIK:</strong> {user.nik}
                        </div>
                        {user.nomor_rw && (
                            <div className="mb-1">
                                <strong>Nomor RW:</strong> {user.nomor_rw}
                            </div>
                        )}
                        {user.id_rt && (
                            <div className="mb-1">
                                <strong>ID RT:</strong> {user.id_rt}
                            </div>
                        )}
                    </div>

                    {/* Form ubah password */}
                    <div className="border-bottom mb-4"></div>
                    <h5 className="fw-semibold mb-3 text-gray-800">
                        <i className="fas fa-key text-primary me-2"></i> Ubah Password
                    </h5>

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-3">
                            <label htmlFor="current_password" className="form-label">
                                <i className="fas fa-lock me-2"></i> Password Lama
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwordData.current_password}
                                onChange={(e) =>
                                    setPasswordData("current_password", e.target.value)
                                }
                                required
                            />
                            {passwordErrors.current_password && (
                                <div className="text-danger small mt-1">
                                    {passwordErrors.current_password}
                                </div>
                            )}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                <i className="fas fa-lock me-2"></i> Password Baru
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwordData.password}
                                onChange={(e) =>
                                    setPasswordData("password", e.target.value)
                                }
                                required
                                minLength={8}
                            />
                            {passwordErrors.password && (
                                <div className="text-danger small mt-1">
                                    {passwordErrors.password}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="password_confirmation"
                                className="form-label"
                            >
                                <i className="fas fa-lock me-2"></i> Konfirmasi Password
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                value={passwordData.password_confirmation}
                                onChange={(e) =>
                                    setPasswordData("password_confirmation", e.target.value)
                                }
                                required
                            />
                            {passwordErrors.password_confirmation && (
                                <div className="text-danger small mt-1">
                                    {passwordErrors.password_confirmation}
                                </div>
                            )}
                        </div>

                        <div className="d-flex justify-content-end gap-2 mb-4">
                            <button
                                type="submit"
                                disabled={passwordProcessing}
                                className="btn btn-primary px-4"
                            >
                                <i className="fas fa-save me-1"></i> Simpan Password
                            </button>
                        </div>
                    </form>
                    {(role === "rw" || role === "admin") && (
                        <>
                            {/* 🔧 Pengaturan Sistem */}
                            <div className="border-bottom mb-4"></div>

                            <h5 className="fw-semibold mb-3 text-gray-800">
                                <i className="fas fa-sliders-h text-success me-2"></i>
                                Pengaturan Sistem
                            </h5>

                            <form onSubmit={handleSettingsSubmit}>
                                {/* 🔹 Input Maksimal RT per RW */}
                                <div className="mb-3">
                                    <label htmlFor="max_rt_per_rw" className="form-label">
                                        <i className="fas fa-home me-2"></i>
                                        Maksimal RT per RW
                                    </label>

                                    {/* 🔸 Teks nilai saat ini */}
                                    <small className="text-muted d-block mb-2">
                                        Max RT per RW saat ini:{" "}
                                        <span className="fw-semibold text-dark">
                                            {settings?.max_rt_per_rw ?? "-"}
                                        </span>
                                    </small>

                                    <input
                                        type="number"
                                        id="max_rt_per_rw"
                                        name="max_rt_per_rw"
                                        className="form-control"
                                        min={1}
                                        onChange={(e) =>
                                            setSettingsData("max_rt_per_rw", e.target.value)
                                        }
                                        required
                                    />

                                    {settingsErrors.max_rt_per_rw && (
                                        <div className="text-danger small mt-1">
                                            {settingsErrors.max_rt_per_rw}
                                        </div>
                                    )}
                                </div>

                                {/* 🔘 Tombol Simpan */}
                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-success px-4"
                                        disabled={settingsProcessing}
                                    >
                                        <i className="fas fa-save me-1"></i>
                                        Simpan Pengaturan
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
