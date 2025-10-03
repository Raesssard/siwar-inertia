import React from "react"

export default function FilePreview({ filePath, judul, displayStyle }) {
    // Ambil ekstensi file
    const extension = filePath.split(".").pop().toLowerCase()

    const openDocumentModal = (path, isPdf) => {
        // bikin sesuai logika modalmu
        console.log("Open:", path, "isPdf:", isPdf)
    }

    if (["pdf"].includes(extension)) {
        return (
            <embed
                src={`${filePath}#zoom=page-fit`}
                type="application/pdf"
                style={displayStyle}
            />
        )
    }

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
        return (
            <img
                src={filePath}
                alt={`File ${judul ?? ""}`}
                style={displayStyle}
            />
        )
    }

    if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) {
        return (
            <video
                autoPlay
                muted
                loop
                className="video-preview max-w-[300px] rounded"
                style={displayStyle}>
                <source src={filePath} type={`video/${extension}`} />
                Browser tidak mendukung video ini.
            </video>
        )
    }

    if (["doc", "docx"].includes(extension)) {
        return (
            <div
                className="doc-thumbnail-container cursor-pointer"
                style={displayStyle}
            >
                <i className="far fa-file-word text-primary fa-3x"></i>
                <p className="doc-filename">Lihat Dokumen Word</p>
            </div>
        )
    }

    return (
        <div className="mt-3"></div>
    )
}
