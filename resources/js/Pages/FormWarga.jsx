import React, { useEffect } from "react";
import { useForm, router, Head } from "@inertiajs/react";
import { route } from "ziggy-js";
import Layout from "@/Layouts/Layout";
import { i } from "framer-motion/client";

export default function FormWarga({
  warga = null,
  noKK,
  onClose,
  role,
  wargaList = [],
}) {
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
    status_hubungan_dalam_keluarga: warga?.status_hubungan_dalam_keluarga ?? "",
    kewarganegaraan: warga?.kewarganegaraan ?? "WNI",
    nama_ayah: warga?.nama_ayah ?? "",
    nama_ibu: warga?.nama_ibu ?? "",
    status_warga: warga?.status_warga ?? "penduduk",

    // Data tambahan untuk WNA
    no_paspor: warga?.no_paspor ?? "",
    tgl_terbit_paspor: warga?.tgl_terbit_paspor ?? "",
    tgl_berakhir_paspor: warga?.tgl_berakhir_paspor ?? "",
    no_kitas: warga?.no_kitas ?? "",
    tgl_terbit_kitas: warga?.tgl_terbit_kitas ?? "",
    tgl_berakhir_kitas: warga?.tgl_berakhir_kitas ?? "",
    no_kitap: warga?.no_kitap ?? "",
    tgl_terbit_kitap: warga?.tgl_terbit_kitap ?? "",
    tgl_berakhir_kitap: warga?.tgl_berakhir_kitap ?? "",

    // Data tambahan untuk pendatang
    alamat_asal: warga?.alamat_asal ?? "",
    alamat_domisili: warga?.alamat_domisili ?? "",
    tanggal_mulai_tinggal: warga?.tanggal_mulai_tinggal ?? "",
    tujuan_pindah: warga?.tujuan_pindah ?? "",
  });

  // Auto set No KK untuk mode tambah
  useEffect(() => {
    if (!isEdit && noKK) setData("no_kk", noKK);
  }, [noKK]);

  // Auto isi nama ayah & ibu jika anak
  useEffect(() => {
    if (
      !isEdit &&
      data.status_hubungan_dalam_keluarga === "anak" &&
      wargaList.length > 0
    ) {
      const ayah = wargaList.find(
        (w) => w.status_hubungan_dalam_keluarga === "kepala keluarga"
      );
      const ibu = wargaList.find(
        (w) => w.status_hubungan_dalam_keluarga === "istri"
      );

      if (ayah && !data.nama_ayah) setData("nama_ayah", ayah.nama);
      if (ibu && !data.nama_ibu) setData("nama_ibu", ibu.nama);
    }
  }, [data.status_hubungan_dalam_keluarga, wargaList]);

  // Tentukan route utama (baseRoute) untuk RW atau Admin
  const baseRoute = role === "admin" ? "admin.warga" : "rw.warga";

  // Tentukan route kembali (kartu keluarga index)
  const kkRoute =
    role === "admin" ? "admin.kartu_keluarga" : "rw.kartu_keluarga";

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      put(route(`${baseRoute}.update`, warga.id), {
        preserveScroll: true,
        onSuccess: (res) => {
          if (res.props.flash.success) {
            router.visit(route(`${kkRoute}.index`));
          }
        },
      });
    } else {
      post(route(`${baseRoute}.store`), {
        preserveScroll: true,
        onSuccess: (res) => {
          if (res.props.flash.success) {
            router.visit(route(`${kkRoute}.index`));
          }
        },
      });
    }
  };

  const inputBase =
    "w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition text-gray-800";

  return (
    <Layout>
      <Head title={isEdit ? "Edit Warga" : "Tambah Warga"} />

      <div className="max-w-6xl mx-auto bg-white p-10 mt-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 pb-3 mb-8">
          {isEdit ? "Edit Data Warga" : "Tambah Warga"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* =================== DATA PRIBADI =================== */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-5 border-l-4 border-blue-500 pl-3">
              Data Pribadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* No KK */}
              <div>
                <label className="font-medium text-gray-700">No KK</label>
                <input
                  type="text"
                  value={data.no_kk}
                  onChange={(e) => setData("no_kk", e.target.value)}
                  className={inputBase}
                  required
                  maxLength={16}
                />
                {errors.no_kk && (
                  <p className="text-red-500 text-sm">{errors.no_kk}</p>
                )}
              </div>
              {/* NIK */}
              <div>
                <label className="font-medium text-gray-700">NIK</label>
                <input
                  type="text"
                  value={data.nik}
                  maxLength={16}
                  onChange={(e) => setData("nik", e.target.value)}
                  className={inputBase}
                  required
                />
                {errors.nik && (
                  <p className="text-red-500 text-sm">{errors.nik}</p>
                )}
              </div>

              {/* Nama, tempat lahir, dll */}
              {[
                { name: "nama", label: "Nama Lengkap", type: "text", required: true },
                { name: "tempat_lahir", label: "Tempat Lahir", type: "text" },
                { name: "tanggal_lahir", label: "Tanggal Lahir", type: "date", required: true },
                { name: "pendidikan", label: "Pendidikan", type: "text" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="font-medium text-gray-700">{f.label}</label>
                  <input
                    type={f.type}
                    value={data[f.name]}
                    onChange={(e) => setData(f.name, e.target.value)}
                    className={inputBase}
                  />
                  {errors[f.name] && (
                    <p className="text-red-500 text-sm">{errors[f.name]}</p>
                  )}
                </div>
              ))}
              {/* Pekerjaan */}
              {/* Agama */}
              <div>
                <label className="font-medium text-gray-700">Agama</label>
                <select
                  value={data.agama}
                  onChange={(e) => setData("agama", e.target.value)}
                  className={inputBase}
                  required
                >
                  <option value="">-- Pilih Agama --</option>
                  <option value="Islam">Islam</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Kong Hu Cu">Kong Hu Cu</option>
                  <option value="Kristen Katholik">Kristen Katholik</option>
                  <option value="Kristen Protestan">Kristen Protestan</option>
                </select>

                {errors.agama && (
                  <p className="text-red-500 text-sm">{errors.agama}</p>
                )}
              </div>
              <div>
                <label className="font-medium text-gray-700">Pekerjaan</label>
                <select
                  value={data.pekerjaan}
                  onChange={(e) => setData("pekerjaan", e.target.value)}
                  className={inputBase}
                  required
                >
                  <option value="">Pilih pekerjaan</option>
                  <option value="pelajar/mahasiswa">Pelajar / Mahasiswa</option>
                  <option value="pegawai negeri sipil">Pegawai Negeri Sipil (PNS)</option>
                  <option value="karyawan swasta">Karyawan Swasta</option>
                  <option value="pekerja lepas harian">Pekerja Lepas Harian</option>
                  <option value="wirausaha">Wirausaha</option>
                  <option value="petani">Petani</option>
                  <option value="nelayan">Nelayan</option>
                  <option value="tni">TNI</option>
                  <option value="polri">POLRI</option>
                  <option value="pensiunan">Pensiunan</option>
                  <option value="ibu rumah tangga">Ibu Rumah Tangga</option>
                  <option value="tidak bekerja">Tidak Bekerja</option>
                  <option value="lainnya">Lainnya</option>
                </select>
                {errors.pekerjaan && (
                  <p className="text-red-500 text-sm">{errors.pekerjaan}</p>
                )}
              </div>
              {/* Jenis Kelamin */}
              <div>
                <label className="font-medium text-gray-700">Jenis Kelamin</label>
                <select
                  value={data.jenis_kelamin}
                  onChange={(e) => setData("jenis_kelamin", e.target.value)}
                  className={inputBase}
                  required
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="laki-laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>

              {/* Golongan Darah */}
              <div>
                <label className="font-medium text-gray-700">Golongan Darah</label>
                <select
                  value={data.golongan_darah}
                  onChange={(e) => setData("golongan_darah", e.target.value)}
                  className={inputBase}
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
                <label className="font-medium text-gray-700">Status Perkawinan</label>
                <select
                  value={data.status_perkawinan}
                  onChange={(e) => setData("status_perkawinan", e.target.value)}
                  className={inputBase}
                >
                  <option value="">Pilih status</option>
                  <option value="belum menikah">Belum menikah</option>
                  <option value="menikah">Menikah</option>
                  <option value="cerai_hidup">Cerai Hidup</option>
                  <option value="cerai_mati">Cerai Mati</option>
                </select>
              </div>

              {/* Kewarganegaraan */}
              <div>
                <label className="font-medium text-gray-700">Kewarganegaraan</label>
                <select
                  value={data.kewarganegaraan}
                  onChange={(e) => setData("kewarganegaraan", e.target.value)}
                  className={inputBase}
                  required
                >
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
              </div>

              {/* Status Warga */}
              <div>
                <label className="font-medium text-gray-700">Status Warga</label>
                <select
                  value={data.status_warga}
                  onChange={(e) => setData("status_warga", e.target.value)}
                  className={inputBase}
                  required
                >
                  <option value="penduduk">Penduduk</option>
                  <option value="pendatang">Pendatang</option>
                </select>
              </div>          
              <div>
                <label className="font-medium text-gray-700">Hubungan Dalam Keluarga</label>
                <select
                  value={data.status_hubungan_dalam_keluarga}
                  onChange={(e) =>
                    setData("status_hubungan_dalam_keluarga", e.target.value)
                  }
                  className={inputBase}
                  required
                >
                  <option value="">Pilih hubungan</option>
                  <option value="kepala keluarga">Kepala keluarga</option>
                  <option value="istri">Istri</option>
                  <option value="anak">Anak</option>
                </select>
              </div>
            </div>
          </section>

          {/* <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-5 border-l-4 border-blue-500 pl-3">
              Data Keluarga
            </h3>

            
              <div>
                <label className="font-medium text-gray-700">Nama Ayah</label>
                <input
                  type="text"
                  value={data.nama_ayah}
                  onChange={(e) => setData("nama_ayah", e.target.value)}
                  className={inputBase}     
                />
              </div>

              <div>
                <label className="font-medium text-gray-700">Nama Ibu</label>
                <input
                  type="text"
                  value={data.nama_ibu}
                  onChange={(e) => setData("nama_ibu", e.target.value)}
                  className={inputBase}
                />
              </div>

          </section> */}

          {/* <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-5 border-l-4 border-blue-500 pl-3">
              Dokumen (Paspor / KITAS / KITAP) *Opsional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "no_paspor", label: "No Paspor" },
                { name: "tgl_terbit_paspor", label: "Tgl Terbit Paspor", type: "date" },
                { name: "tgl_berakhir_paspor", label: "Tgl Berakhir Paspor", type: "date" },
                { name: "no_kitas", label: "No KITAS" },
                { name: "tgl_terbit_kitas", label: "Tgl Terbit KITAS", type: "date" },
                { name: "tgl_berakhir_kitas", label: "Tgl Berakhir KITAS", type: "date" },
                { name: "no_kitap", label: "No KITAP" },
                { name: "tgl_terbit_kitap", label: "Tgl Terbit KITAP", type: "date" },
                { name: "tgl_berakhir_kitap", label: "Tgl Berakhir KITAP", type: "date" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="font-medium text-gray-700">{f.label}</label>
                  <input
                    type={f.type ?? "text"}
                    value={data[f.name]}
                    onChange={(e) => setData(f.name, e.target.value)}
                    className={inputBase}
                  />
                </div>
              ))}
            </div>
          </section> */}

          {data.status_warga === "pendatang" && (
            <section>
              <h3 className="text-lg font-semibold text-gray-700 mb-5 border-l-4 border-blue-500 pl-3">
                Alamat & Domisili Pendatang
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-medium text-gray-700">Alamat Asal</label>
                  <textarea
                    value={data.alamat_asal}
                    onChange={(e) => setData("alamat_asal", e.target.value)}
                    className={`${inputBase} min-h-[100px]`}r
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700">Alamat Domisili</label>
                  <textarea
                    value={data.alamat_domisili}
                    onChange={(e) => setData("alamat_domisili", e.target.value)}
                    className={`${inputBase} min-h-[100px]`}
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700">Tanggal Mulai Tinggal</label>
                  <input
                    type="date"
                    value={data.tanggal_mulai_tinggal}
                    onChange={(e) => setData("tanggal_mulai_tinggal", e.target.value)}
                    className={inputBase}
                    required
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-700">Tujuan Pindah</label>
                  <input
                    type="text"
                    value={data.tujuan_pindah}
                    onChange={(e) => setData("tujuan_pindah", e.target.value)}
                    className={inputBase}
                    required
                  />
                </div>
              </div>
            </section>
          )}

          {/* =================== ACTION BUTTONS =================== */}
          <div className="flex justify-end gap-4 pt-8 border-t-2 border-gray-200 mt-8">
            <button
              type="submit"
              className="btn btn-success text-white px-6 py-2 rounded-lg shadow-sm"
              disabled={processing}
            >
              {processing ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => router.visit(route(`${kkRoute}.index`))}
              className="btn btn-secondary px-6 py-2 rounded-lg shadow-sm"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
