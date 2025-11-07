import React, { useState, useEffect, useRef } from "react"
import Layout from "@/Layouts/Layout"
import { Head, usePage, useForm } from "@inertiajs/react"
import Masonry from "react-masonry-css"
import FileDisplay from "./Component/FileDisplay"
import { DetailPengaduan, TambahPengaduan } from "./Component/Modal"
import { FilterPengaduan } from "./Component/Filter"
import Role from "./Component/Role"

export function FormatWaktu({ createdAt }) {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now - created
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffWeek = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))

    if (diffDays < 1) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor(diffMs / (1000 * 60))

        if (diffHours > 0) return `${diffHours} jam yang lalu`
        if (diffMinutes > 0) return `${diffMinutes} menit yang lalu`
        return "baru saja"
    }

    if (diffDays < 8) {
        return `${diffDays} hari yang lalu`
    }

    if (diffDays < 30) {
        return `${diffWeek} minggu yang lalu`
    }

    return (
        <>
            {created.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })}
        </>
    )
}

function getWeek(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const dayOfWeek = (firstDayOfYear.getDay() + 6) % 7;
    const daysSinceYearStart = (date - firstDayOfYear) / 86400000;
    return Math.ceil((daysSinceYearStart + dayOfWeek + 1) / 7);
}

export function splitWaktu({ createdAt }) {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now - created
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const sameWeek =
        getWeek(now) === getWeek(created) &&
        now.getFullYear() === created.getFullYear()

    const sameMonth =
        now.getMonth() === created.getMonth() &&
        now.getFullYear() === created.getFullYear()

    const lastMonth =
        now.getMonth() - created.getMonth() === 1 &&
        now.getFullYear() === created.getFullYear()

    if (diffDays < 1) {
        return "Hari ini"
    } else if (diffDays < 2) {
        return "Kemarin"
    } else if (sameWeek) {
        return "Minggu ini"
    } else if (!sameWeek && sameMonth) {
        return "Bulan ini"
    } else if (lastMonth) {
        return "Bulan lalu"
    } else {
        const namaBulan = created.toLocaleString("id-ID", { month: "long" })
        return `${namaBulan} ${created.getFullYear()}`
    }

}

export default function Pengaduan() {
    const { pengaduan: pengaduanFromServer,
        title,
        total_pengaduan,
        total_pengaduan_filtered,
        list_bulan,
        list_tahun,
        list_level } = usePage().props
    const { props } = usePage()
    const role = props.auth?.currentRole
    const user = props.auth?.user
    const [selected, setSelected] = useState(null)
    const [showModalDetail, setShowModalDetail] = useState(false)
    const [showModalTambah, setShowModalTambah] = useState(false)
    const cardBodyRef = useRef(null)
    const [showButton, setShowButton] = useState(false)
    const [pengaduanList, setPengaduanList] = useState(pengaduanFromServer)
    const [total, setTotal] = useState(total_pengaduan)
    const [totalFiltered, setTotalFiltered] = useState(total_pengaduan_filtered)
    const { get, data, setData } = useForm({
        search: '',
        tahun: '',
        bulan: '',
        kategori: ''
    })
    const modalDetail = (item) => {
        setSelected(item)
        setShowModalDetail(true)
    }

    const scrollToTop = () => {
        if (cardBodyRef.current) {
            cardBodyRef.current.scrollTo({
                top: 0,
                behavior: "smooth"
            })
        }
    }

    const groupByWaktu = pengaduanList.reduce((groups, item) => {
        const kategori = splitWaktu({ createdAt: item.created_at })
        if (!groups[kategori]) groups[kategori] = []
        groups[kategori].push(item)
        return groups
    }, {})

    const order = [
        "Hari ini",
        "Kemarin",
        "Minggu ini",
        "Bulan ini",
        "Bulan lalu"
    ]

    const sortedGroup = Object.entries(groupByWaktu).sort(([a], [b]) => {
        const indexA = order.indexOf(a)
        const indexB = order.indexOf(b)
        if (indexA !== -1 && indexB !== -1) return indexA - indexB

        if (indexA !== -1) return -1
        if (indexB !== -1) return 1

        const [bulanA, tahunA] = a.split(" ")
        const [bulanB, tahunB] = b.split(" ")
        const monthOrder = [
            "januari", "februari", "maret", "april", "mei", "juni",
            "juli", "agustus", "september", "oktober", "november", "desember"
        ]

        const tA = parseInt(tahunA)
        const tB = parseInt(tahunB)
        if (tA !== tB) return tB - tA
        return monthOrder.indexOf(bulanB.toLowerCase()) - monthOrder.indexOf(bulanA.toLowerCase())
    })


    useEffect(() => {
        setTotal(total_pengaduan)
        setTotalFiltered(total_pengaduan_filtered)
        setPengaduanList(pengaduanFromServer)
    }, [total_pengaduan, total_pengaduan_filtered, pengaduanFromServer])

    useEffect(() => {
        const handleScroll = () => {
            if (cardBodyRef.current) {
                const scrollTop = cardBodyRef.current.scrollTop
                setShowButton(scrollTop > 50)
            }
        }

        const cardBody = cardBodyRef.current
        if (cardBody) {
            cardBody.addEventListener("scroll", handleScroll)
        }

        return () => {
            if (cardBody) {
                cardBody.removeEventListener("scroll", handleScroll)
            }
        }
    }, [])

    const breakpointColumnsObj = {
        default: 5,
        1100: 4,
        700: 3,
        500: 2
    }

    const imgStyle = {
        width: "100%",
        height: "100%",
        maxWidth: "350px",
        objectFit: "cover",
        marginBottom: "10px",
        borderRadius: "0.35rem",
        display: "block",
    }

    const filter = (e) => {
        e.preventDefault()
        get(`/${role}/pengaduan`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
            tahun: '',
            bulan: '',
            kategori: ''
        })
    }

    return (
        <Layout>
            <Head title={`${title} - ${role.length <= 2
                ? role.toUpperCase()
                : role.charAt(0).toUpperCase() + role.slice(1)}`} />
            <FilterPengaduan
                data={data}
                setData={setData}
                list_tahun={list_tahun}
                list_bulan={list_bulan}
                list_level={list_level}
                filter={filter}
                resetFilter={resetFilter}
                tambahShow={() => setShowModalTambah(true)}
                role={role}
            />
            <div className="d-flex align-items-center ms-3 me-3 mb-3 mt-0 w-100">
                <i className="fas fa-paper-plane me-2 text-primary"></i>
                {totalFiltered} Pengaduan
            </div>
            <div className="col-12">
                {pengaduanList.length ? sortedGroup.map(([kategori, items]) => (
                    <div key={kategori}>
                        <div className="d-flex align-items-center w-100">
                            <div className="text-muted mb-3 mt-3 ms-4 me-4">
                                {kategori}
                            </div>
                            <div className="text-muted mr-4 ml-auto">
                                Menampilkan {items.length} dari total {total} Pengumuman
                            </div>
                        </div>
                        <div ref={cardBodyRef} className="card-body pengaduan">
                            {items.length && (
                                <>
                                    <Masonry
                                        breakpointCols={breakpointColumnsObj}
                                        className="flex gap-4"
                                        columnClassName="space-y-4"
                                    >
                                        {items.map((item, index) => {
                                            const labelMap = {
                                                belum: "Belum dibaca",
                                                diproses_menunggu: "Menunggu konfirmasi RW",
                                                diproses_sudah: "Sudah dikonfirmasi",
                                                diproses_default: "Sedang diproses",
                                                selesai: "Selesai"
                                            }

                                            const colorMap = {
                                                belum: "gray",
                                                diproses_menunggu: "blue",
                                                diproses_sudah: "cyan",
                                                diproses_default: "yellow",
                                                selesai: "green"
                                            }

                                            const colorClassMap = {
                                                gray: "bg-gray-200 text-gray-800",
                                                blue: "bg-blue-200 text-blue-800",
                                                cyan: "bg-cyan-200 text-cyan-800",
                                                yellow: "bg-yellow-200 text-yellow-800",
                                                green: "bg-green-200 text-green-800",
                                            }

                                            const key = `${item.status}${item.status === "diproses" ? "_" + (item.konfirmasi_rw || "default") : ""}`
                                            const color = colorMap[key] || "gray"
                                            const colorClasses = colorClassMap[color] || "bg-gray-200 text-gray-800"
                                            const label = labelMap[key] || "Status tidak diketahui"

                                            return (
                                                <div key={index} className="card-clickable d-flex justify-content-center align-items-center flex-column" onClick={() => modalDetail(item)}>
                                                    <FileDisplay
                                                        filePath={`/storage/${item.file_path}`}
                                                        judul={item.file_name}
                                                        displayStyle={imgStyle} />
                                                    <h2 className="font-semibold text-lg mb-2 text-left ms-3 me-3">{item.judul}</h2>
                                                    <div className="text-sm text-gray-500 mb-2 d-flex gap-3">
                                                        <span><i className="fas fa-user mr-1"></i>{item.warga.nama}</span>
                                                        <span><i className="fas fa-clock mr-1"></i><FormatWaktu createdAt={item.created_at} /></span>
                                                    </div>
                                                    <Role role="warga">
                                                        {item.nik_warga !== user.nik ? (
                                                            <div className="text-sm text-gray-500 mb-2 d-flex gap-3">
                                                                <span><i className="fas fa-users mr-1"></i>RT {item.warga?.kartu_keluarga?.rukun_tetangga?.rt}/RW {item.warga?.kartu_keluarga?.rw?.nomor_rw}</span>
                                                            </div>
                                                        ) : ""}
                                                    </Role>

                                                    <p className="isi-pengaduan text-gray-700 text-sm mb-3 ms-3 me-3 line-clamp-3">
                                                        {item.isi.length > 100 ? item.isi.slice(0, 100) + "..." : item.isi}
                                                    </p>
                                                    <Role role="warga">
                                                        {item.nik_warga === user.nik ?
                                                            <span className={`px-2 py-1 rounded font-semibold ${colorClasses}`} style={{ fontSize: "0.85rem" }}>
                                                                {label}
                                                            </span>
                                                            :
                                                            ""
                                                        }
                                                    </Role>
                                                </div>
                                            )
                                        })}
                                    </Masonry>
                                    {showButton && (
                                        <button
                                            onClick={scrollToTop}
                                            className={`btn btn-primary scroll-top-btn ${showButton ? "show" : ""}`}
                                        >
                                            <i className="fas fa-arrow-up"></i>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )) : (
                    <div ref={cardBodyRef} className="card-body pengaduan">
                        <span className="d-block w-100 text-muted text-center">Tidak ada pengaduan</span>
                    </div>
                )}
                <DetailPengaduan
                    selectedData={selected}
                    detailShow={showModalDetail}
                    onClose={() => setShowModalDetail(false)}
                    onUpdated={(updated) => {
                        setSelected(updated)
                        setPengaduanList(prev =>
                            prev.map(item =>
                                item.id === updated.id ? updated : item
                            )
                        )
                    }}
                    onDeleted={(deletedId) => {
                        setPengaduanList(prev => prev.filter(item => item.id !== deletedId))
                        setTotal(prev => prev - 1)
                        setTotalFiltered(prev => prev - 1)
                        setShowModalDetail(false)
                    }}
                    userData={user}
                    role={role}
                />
                <TambahPengaduan
                    tambahShow={showModalTambah}
                    onClose={() => setShowModalTambah(false)}
                    onAdded={(newPengaduan) => {
                        setPengaduanList(prev => [newPengaduan, ...prev])
                        setTotal(prev => prev + 1)
                        setTotalFiltered(prev => prev + 1)
                        setSelected(newPengaduan)
                        setShowModalDetail(true)
                    }}
                />
            </div>
        </Layout>
    )
}