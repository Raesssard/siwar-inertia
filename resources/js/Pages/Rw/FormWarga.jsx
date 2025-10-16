import React, { useEffect } from "react";
import { useForm, router, Head } from "@inertiajs/react";
import { route } from "ziggy-js";
import Layout from "@/Layouts/Layout";

export default function FormWarga({ warga = null, noKK, onClose, role }) {
  const isEdit = !!warga;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    nik: warga?.nik ?? "",
    no_kk: warga?.no_kk ?? noKK ?? "",
    nama: warga?.nama ?? "",
    jenis_kelamin: warga?.jenis_kelamin ?? "",
    tempat_lahir: warga?.tempat_lahir ?? "",
    tanggal_lahir: warga?.tanggal_lahir ?? "",
    agama: warga?.agama ?? "",
    pendidikan: warga?.pendidikan ?? "",
    pekerjaan: warga?.pekerjaan ?? "",
    golongan_darah: warga?.golongan_darah ?? "",
    status_perkawinan: warga?.status_perkawinan ?? "",
    status_hubungan_dalam_keluarga:
      warga?.status_hubungan_dalam_keluarga ?? "",
    kewarganegaraan: warga?.kewarganegaraan ?? "WNI",
    no_paspor: warga?.no_paspor ?? "",
    no_kitas_kitap: warga?.no_kitas_kitap ?? "",
    nama_ayah: warga?.nama_ayah ?? "",
    nama_ibu: warga?.nama_ibu ?? "",
    status_warga: warga?.status_warga ?? "penduduk",
  });

  useEffect(() => {
    if (!isEdit && noKK) setData("no_kk", noKK);
  }, [noKK]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route("rw.warga.update", warga.id), {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          onClose?.();
        },
      });
    } else {
      post(route("rw.warga.store"), {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          onClose?.();
        },
      });
    }
  };

  const handleDelete = () => {
    if (!confirm("Yakin ingin menghapus data warga ini?")) return;
    router.delete(route("rw.warga.destroy", warga.id), {
      preserveScroll: true,
      onSuccess: () => onClose?.(),
    });
  };

  return (
    <Layout title={isEdit ? "Edit Data Warga" : "Tambah Warga"}>
      <Head title={isEdit ? "Edit Warga" : "Tambah Warga"} />

      <div className="max-w-5xl mx-auto bg-white p-6 mt-6 rounded-2xl shadow">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-6">
          {isEdit ? "Edit Data Warga" : "Tambah Warga"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NIK */}
            <div>
              <label className="font-medium">NIK</label>
              <input
                type="text"
                value={data.nik}
                onChange={(e) => setData("nik", e.target.value)}
                className="input input-bordered w-full"
                placeholder="Masukkan NIK"
              />
              {errors.nik && (
                <p className="text-red-500 text-sm">{errors.nik}</p>
              )}
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="font-medium">Nama Lengkap</label>
              <input
                type="text"
                value={data.nama}
                onChange={(e) => setData("nama", e.target.value)}
                className="input input-bordered w-full"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="font-medium">Jenis Kelamin</label>
              <select
                value={data.jenis_kelamin}
                onChange={(e) => setData("jenis_kelamin", e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>

            {/* Tempat Lahir */}
            <div>
              <label className="font-medium">Tempat Lahir</label>
              <input
                type="text"
                value={data.tempat_lahir}
                onChange={(e) => setData("tempat_lahir", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="font-medium">Tanggal Lahir</label>
              <input
                type="date"
                value={data.tanggal_lahir}
                onChange={(e) => setData("tanggal_lahir", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Agama */}
            <div>
              <label className="font-medium">Agama</label>
              <input
                type="text"
                value={data.agama}
                onChange={(e) => setData("agama", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Pendidikan */}
            <div>
              <label className="font-medium">Pendidikan</label>
              <input
                type="text"
                value={data.pendidikan}
                onChange={(e) => setData("pendidikan", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Pekerjaan */}
            <div>
              <label className="font-medium">Pekerjaan</label>
              <input
                type="text"
                value={data.pekerjaan}
                onChange={(e) => setData("pekerjaan", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Golongan Darah */}
            <div>
              <label className="font-medium">Golongan Darah</label>
              <select
                value={data.golongan_darah}
                onChange={(e) => setData("golongan_darah", e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">-</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>

            {/* Status Perkawinan */}
            <div>
              <label className="font-medium">Status Perkawinan</label>
              <select
                value={data.status_perkawinan}
                onChange={(e) => setData("status_perkawinan", e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="">Pilih status</option>
                <option value="belum menikah">Belum menikah</option>
                <option value="menikah">Menikah</option>
                <option value="cerai hidup">Cerai Hidup</option>
                <option value="cerai mati">Cerai Mati</option>
              </select>
            </div>

            {/* Hubungan Dalam Keluarga */}
            <div>
              <label className="font-medium">Hubungan Dalam Keluarga</label>
              <select
                value={data.status_hubungan_dalam_keluarga}
                onChange={(e) =>
                  setData("status_hubungan_dalam_keluarga", e.target.value)
                }
                className="select select-bordered w-full"
              >
                <option value="">Pilih hubungan</option>
                <option value="kepala keluarga">Kepala keluarga</option>
                <option value="istri">Istri</option>
                <option value="anak">Anak</option>
              </select>
            </div>

            {/* Kewarganegaraan */}
            <div>
              <label className="font-medium">Kewarganegaraan</label>
              <select
                value={data.kewarganegaraan}
                onChange={(e) => setData("kewarganegaraan", e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="WNI">WNI</option>
                <option value="WNA">WNA</option>
              </select>
            </div>

            {/* No Paspor */}
            <div>
              <label className="font-medium">No Paspor</label>
              <input
                type="text"
                value={data.no_paspor}
                onChange={(e) => setData("no_paspor", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* No KITAS/KITAP */}
            <div>
              <label className="font-medium">No KITAS/KITAP</label>
              <input
                type="text"
                value={data.no_kitas_kitap}
                onChange={(e) => setData("no_kitas_kitap", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Nama Ayah */}
            <div>
              <label className="font-medium">Nama Ayah</label>
              <input
                type="text"
                value={data.nama_ayah}
                onChange={(e) => setData("nama_ayah", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Nama Ibu */}
            <div>
              <label className="font-medium">Nama Ibu</label>
              <input
                type="text"
                value={data.nama_ibu}
                onChange={(e) => setData("nama_ibu", e.target.value)}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-error text-white"
              >
                Hapus
              </button>
            )}
            <button
              type="submit"
              className="btn btn-success"
              disabled={processing}
            >
              {processing ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="btn btn-secondary"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
