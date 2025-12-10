import React, { useState, useEffect, useRef } from "react"
import Layout from "@/Layouts/Layout"
import { Head, usePage, useForm } from "@inertiajs/react"
import { DetailPengumuman, TambahPengumuman } from "./Component/Modal"
import { FilterPengumuman } from "./Component/Filter"
import Masonry from "react-masonry-css"
import FileDisplay from "./Component/FileDisplay"
import { FormatWaktu, splitWaktu } from "./Pengaduan"
import Role from "./Component/Role"

export default function Pengumuman() {
    const {
        title,
        pengumuman: pengumumanFromServer,
        list_bulan,
        daftar_tahun,
        daftar_kategori: daftarKategoriFromServer,
        total_pengumuman,
        total_pengumuman_filtered,
    } = usePage().props
    const [selected, setSelected] = useState(null)
    const [showModalDetail, setShowModalDetail] = useState(false)
    const [showModalTambah, setShowModalTambah] = useState(false)
    const cardBodyRef = useRef(null)
    const [showButton, setShowButton] = useState(false)
    const [pengumumanList, setPengumumanList] = useState(pengumumanFromServer)
    const { props } = usePage()
    const [total, setTotal] = useState(total_pengumuman)
    const [totalFiltered, setTotalFiltered] = useState(total_pengumuman_filtered)
    const [daftarKategori, setDaftarKategori] = useState(daftarKategoriFromServer)
    const { get, data, setData } = useForm({
        search: '',
        tahun: '',
        bulan: '',
        kategori: '',
        level: ''
    })
    useEffect(() => {
        setPengumumanList(pengumumanFromServer)
        setTotal(total_pengumuman)
        setTotalFiltered(total_pengumuman_filtered)
        setDaftarKategori(daftarKategoriFromServer)
    }, [pengumumanFromServer])

    const groupByWaktu = pengumumanList.reduce((groups, item) => {
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


    const role = props.auth?.currentRole
    const user = props.auth?.user

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
        get(`/${role}/pengumuman`, { preserveState: true, preserveScroll: true })
    }

    const resetFilter = () => {
        setData({
            search: '',
            tahun: '',
            bulan: '',
            kategori: '',
            level: ''
        })
    }

    return (
        <Layout>
            <Head
                title={`${title} - ${role.length <= 2
                    ? role.toUpperCase()
                    : role.replace(/\b\w/g, (char) => char.toUpperCase())
                    }`}
            />
            <FilterPengumuman
                data={data}
                setData={setData}
                daftar_tahun={daftar_tahun}
                list_bulan={list_bulan}
                daftar_kategori={daftarKategori}
                filter={filter}
                resetFilter={resetFilter}
                tambahShow={() => setShowModalTambah(true)}
                role={role}
            />
            <div className="d-flex align-items-center ms-3 me-3 mb-3 mt-0 w-100">
                <i className="fas fa-bullhorn me-2 text-primary"></i>
                {totalFiltered} Pengumuman
                <Role role={['admin', 'rt', 'rw', 'sekretaris']}>
                    <div className="ml-auto">
                        <button type="button" onClick={() => setShowModalTambah(true)} className="btn-input m-0 btn btn-sm btn-success">
                            <i className="fas fa-plus mr-2"></i>
                            Buat Pengumuman
                        </button>
                    </div>
                </Role>
            </div>
            <div className="col-12">
                {pengumumanList.length ? sortedGroup.map(([kategori, items]) => (
                    <div key={kategori}>
                        <div className="d-flex align-items-center w-100">
                            <div className="text-muted mb-3 mt-3 ms-4 me-4">
                                {kategori}
                            </div>
                            <div className="text-muted mr-4 ml-auto">
                                Menampilkan {items.length} dari total {total} Pengumuman
                            </div>
                        </div>
                        <div ref={cardBodyRef} className="card-body pengumuman">
                            {items.length && (
                                <>
                                    <Masonry
                                        breakpointCols={breakpointColumnsObj}
                                        className="flex gap-4"
                                        columnClassName="space-y-4"
                                    >
                                        {items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="card-clickable d-flex justify-content-center align-items-center flex-column"
                                                onClick={() => modalDetail(item)}
                                            >
                                                <FileDisplay
                                                    filePath={`/storage/${item.dokumen_path}`}
                                                    judul={item.dokumen_name}
                                                    displayStyle={imgStyle}
                                                />
                                                <h2 className="font-semibold text-lg mb-2 text-left ms-3 me-3">
                                                    {item.judul}
                                                </h2>
                                                <div className="text-sm text-gray-500 mb-2 d-flex gap-3">
                                                    <span>
                                                        <i className="fas fa-user mr-1"></i>
                                                        {item.rukun_tetangga
                                                            ? item.rukun_tetangga.nama_anggota_rt
                                                            : item.rw.nama_anggota_rw}
                                                    </span>
                                                    <span>
                                                        <i className="fas fa-clock mr-1"></i>
                                                        <FormatWaktu createdAt={item.created_at} />
                                                    </span>
                                                </div>
                                                <p className="isi-pengaduan text-gray-700 text-sm mb-3 ms-3 me-3 line-clamp-3">
                                                    {item.isi.length > 100
                                                        ? item.isi.slice(0, 100) + "..."
                                                        : item.isi}
                                                </p>
                                            </div>
                                        ))}
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
                    <div ref={cardBodyRef} className="card-body pengumuman">
                        <span className="d-block w-100 text-muted text-center">
                            Tidak ada Pengumuman
                        </span>
                    </div>
                )}
                <DetailPengumuman
                    kategori={daftarKategori}
                    selectedData={selected}
                    detailShow={showModalDetail}
                    onClose={() => setShowModalDetail(false)}
                    onUpdated={(updated) => {
                        setSelected(updated)
                        setDaftarKategori(prev => {
                            if (!prev.includes(updated.kategori)) {
                                return [...prev, updated.kategori]
                            }
                            return prev
                        })
                        setPengumumanList(prev =>
                            prev.map(item =>
                                item.id === updated.id ? updated : item
                            )
                        )
                    }}
                    onDeleted={(deletedId) => {
                        setPengumumanList(prev => prev.filter(item => item.id !== deletedId))
                        setTotal(prev => prev - 1)
                        setTotalFiltered(prev => prev - 1)
                        setShowModalDetail(false)
                    }}
                    userData={user}
                    role={role}
                />
                <TambahPengumuman
                    kategori={daftarKategori}
                    tambahShow={showModalTambah}
                    onClose={() => setShowModalTambah(false)}
                    onAdded={(newPengumuman) => {
                        setPengumumanList(prev => [newPengumuman, ...prev])
                        setDaftarKategori(
                            newPengumuman.kategori
                                && !daftarKategori.includes(newPengumuman.kategori)
                                ? [...daftarKategori, newPengumuman.kategori]
                                : daftarKategori
                        )
                        setTotal(prev => prev + 1)
                        setTotalFiltered(prev => prev + 1)
                        setSelected(newPengumuman)
                        setShowModalDetail(true)
                    }}
                    role={role}
                    rwList={props.rwList}
                    rtList={props.rtList}
                />
            </div>
        </Layout>
    )
}