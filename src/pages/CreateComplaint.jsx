import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";

function CreateComplaint({ onBack, onComplaintCreated }) {

    // =========================================================
    // FORM STATE
    // =========================================================

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("");

    // =========================================================
    // PROOF / CAMERA / FILE UPLOAD STATE
    // =========================================================

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    const [proofMode, setProofMode] = useState("idle"); // 'idle' | 'camera' | 'upload'
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraReady, setCameraReady] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Selected proof files & previews
    const [photo, setPhoto] = useState(null); // primary File
    const [photos, setPhotos] = useState([]); // array of Files
    const [photoPreview, setPhotoPreview] = useState(null); // primary preview URL
    const [photoPreviews, setPhotoPreviews] = useState([]); // array of { url, name, size, type }

    // =========================================================
    // SUBMISSION & STATUS STATE
    // =========================================================

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // STOP CAMERA & CLEANUP ON UNMOUNT
    // =========================================================

    useEffect(() => {
        return () => {
            stopCamera();
            cleanupPreviews();
        };
    }, []);

    const cleanupPreviews = () => {
        photoPreviews.forEach((item) => {
            if (item.url) {
                URL.revokeObjectURL(item.url);
            }
        });
        if (photoPreview) {
            URL.revokeObjectURL(photoPreview);
        }
    };

    // =========================================================
    // CAMERA HANDLERS
    // =========================================================

    const openCamera = async () => {
        setError("");
        setMessage("");
        setCameraReady(false);
        setProofMode("camera");

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("Camera access is not supported by this browser.");
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });

            streamRef.current = stream;
            setCameraOpen(true);

            setTimeout(async () => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    try {
                        await videoRef.current.play();
                    } catch (playError) {
                        console.log("Video autoplay error:", playError);
                    }
                    setCameraReady(true);
                }
            }, 100);

        } catch (err) {
            console.error("Camera error:", err);
            if (err.name === "NotAllowedError") {
                setError("Camera permission was denied. Please allow camera access in your browser or use 'Upload Proof'.");
            } else if (err.name === "NotFoundError") {
                setError("No camera was found on this device. You can use 'Upload Proof' from your device.");
            } else {
                setError("Unable to open camera. Please use 'Upload Proof' instead.");
            }
            setProofMode("idle");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraOpen(false);
        setCameraReady(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current || !cameraReady) {
            setError("Camera is not ready yet. Please wait a moment.");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {
            setError("Unable to capture camera image. Please try again.");
            return;
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    setError("Failed to capture photo.");
                    return;
                }

                const filename = `camera-proof-${Date.now()}.jpg`;
                const file = new File([blob], filename, {
                    type: "image/jpeg"
                });

                cleanupPreviews();

                const previewUrl = URL.createObjectURL(blob);
                const previewItem = {
                    url: previewUrl,
                    name: filename,
                    size: (blob.size / 1024).toFixed(1) + " KB",
                    source: "camera"
                };

                setPhoto(file);
                setPhotos([file]);
                setPhotoPreview(previewUrl);
                setPhotoPreviews([previewItem]);
                setProofMode("idle");
                setMessage("Photo captured successfully via camera.");
                setError("");

                stopCamera();
            },
            "image/jpeg",
            0.92
        );
    };

    // =========================================================
    // FILE UPLOAD HANDLERS
    // =========================================================

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;
        processSelectedFiles(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files || []);
        if (droppedFiles.length === 0) return;
        processSelectedFiles(droppedFiles);
    };

    const processSelectedFiles = (selectedFiles) => {
        setError("");
        setMessage("");

        // Validate image mime types / extensions
        const validExtensions = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const invalidFile = selectedFiles.find(
            (f) => !validExtensions.includes(f.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(f.name)
        );

        if (invalidFile) {
            setError(`"${invalidFile.name}" is not a supported image. Please upload JPG, JPEG, PNG, or WEBP.`);
            return;
        }

        // Validate file size (10 MB max per file)
        const oversized = selectedFiles.find((f) => f.size > 10 * 1024 * 1024);
        if (oversized) {
            setError(`"${oversized.name}" exceeds the 10 MB limit. Please select a smaller file.`);
            return;
        }

        // Stop camera if open
        stopCamera();
        cleanupPreviews();

        const previews = selectedFiles.map((f) => ({
            url: URL.createObjectURL(f),
            name: f.name,
            size: (f.size / 1024).toFixed(1) + " KB",
            source: "upload"
        }));

        setPhoto(selectedFiles[0]);
        setPhotos(selectedFiles);
        setPhotoPreview(previews[0].url);
        setPhotoPreviews(previews);
        setProofMode("idle");
        setMessage(
            selectedFiles.length === 1
                ? `Uploaded proof: "${selectedFiles[0].name}"`
                : `${selectedFiles.length} proof images uploaded successfully.`
        );
    };

    // =========================================================
    // REMOVE / RESET PROOF
    // =========================================================

    const removeProof = (index = null) => {
        if (index === null || photoPreviews.length <= 1) {
            cleanupPreviews();
            setPhoto(null);
            setPhotos([]);
            setPhotoPreview(null);
            setPhotoPreviews([]);
            setProofMode("idle");
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            setMessage("");
        } else {
            const updatedPreviews = [...photoPreviews];
            const removed = updatedPreviews.splice(index, 1)[0];
            if (removed?.url) URL.revokeObjectURL(removed.url);

            const updatedFiles = photos.filter((_, i) => i !== index);
            setPhotos(updatedFiles);
            setPhotoPreviews(updatedPreviews);
            setPhoto(updatedFiles[0] || null);
            setPhotoPreview(updatedPreviews[0]?.url || null);
        }
    };

    // =========================================================
    // SUBMIT COMPLAINT
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!title.trim()) {
            setError("Please enter a complaint title.");
            return;
        }

        if (!description.trim()) {
            setError("Please describe the problem.");
            return;
        }

        if (!location.trim()) {
            setError("Please enter the complaint location.");
            return;
        }

        if (!photo && photos.length === 0) {
            setError("Proof is compulsory. Please take a photo with camera or upload proof from your device.");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();

            formData.append("title", title.trim());
            formData.append("description", description.trim());
            formData.append("location", location.trim());

            if (category) {
                formData.append("category", category);
            }

            if (priority) {
                formData.append("priority", priority);
            }

            // Append primary image (single file compatibility)
            if (photo) {
                formData.append("image", photo);
            }

            // Append all images (multiple proof images compatibility)
            if (photos && photos.length > 0) {
                photos.forEach((file) => {
                    formData.append("images", file);
                });
            } else if (photo) {
                formData.append("images", photo);
            }

            const response = await api.post("/complaints", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log("Complaint created:", response.data);
            setMessage("Complaint submitted successfully with proof!");

            if (onComplaintCreated) {
                onComplaintCreated(response.data);
            }

            setTimeout(() => {
                if (onBack) {
                    onBack();
                }
            }, 1200);

        } catch (err) {
            console.error("Complaint submission error:", err);
            let errorMessage = "Failed to submit complaint.";
            if (err.response?.data) {
                if (typeof err.response.data === "string") {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                }
            }
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // STYLES (Fixora Dark & Gold Theme)
    // Background: #0B0B0F, Cards: #18181B, Gold: #D4AF37,
    // Bright Gold: #F5D76E, Text: #FFFFFF, Secondary: #A1A1AA, Border: #3F3F46
    // =========================================================

    const pageStyle = {
        minHeight: "100vh",
        width: "100%",
        padding: "36px 20px 60px",
        background: "#0B0B0F",
        color: "#FFFFFF",
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif'
    };

    const cardStyle = {
        width: "100%",
        maxWidth: "920px",
        margin: "0 auto",
        padding: "38px 42px",
        background: "#18181B",
        border: "1px solid #3F3F46",
        borderRadius: "20px",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)"
    };

    const fieldStyle = {
        width: "100%",
        marginBottom: "24px"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "9px",
        color: "#FFFFFF",
        fontSize: "14px",
        fontWeight: "700",
        letterSpacing: "0.2px"
    };

    const inputStyle = {
        width: "100%",
        height: "50px",
        padding: "0 16px",
        border: "1px solid #3F3F46",
        borderRadius: "10px",
        background: "#121215",
        color: "#FFFFFF",
        fontSize: "15px",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    };

    const textareaStyle = {
        width: "100%",
        minHeight: "130px",
        padding: "14px 16px",
        border: "1px solid #3F3F46",
        borderRadius: "10px",
        background: "#121215",
        color: "#FFFFFF",
        fontSize: "15px",
        lineHeight: "1.5",
        resize: "vertical",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    };

    const selectStyle = {
        width: "100%",
        height: "50px",
        padding: "0 14px",
        border: "1px solid #3F3F46",
        borderRadius: "10px",
        background: "#121215",
        color: "#FFFFFF",
        fontSize: "15px",
        outline: "none",
        cursor: "pointer"
    };

    const buttonStyle = {
        border: "none",
        borderRadius: "10px",
        padding: "12px 22px",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s ease"
    };

    // =========================================================
    // UI RENDER
    // =========================================================

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>

                {/* BACK BUTTON */}
                <button
                    type="button"
                    onClick={() => {
                        stopCamera();
                        if (onBack) onBack();
                    }}
                    style={{
                        ...buttonStyle,
                        marginBottom: "24px",
                        background: "#27272A",
                        color: "#E4E4E7",
                        border: "1px solid #3F3F46",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                    }}
                >
                    ← Back to Dashboard
                </button>

                {/* HEADER */}
                <div style={{ marginBottom: "30px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "28px" }}>🛠️</span>
                        <h1
                            style={{
                                margin: 0,
                                color: "#FFFFFF",
                                fontSize: "30px",
                                fontWeight: "800",
                                letterSpacing: "-0.5px"
                            }}
                        >
                            Report Campus Issue
                        </h1>
                    </div>
                    <p
                        style={{
                            margin: 0,
                            color: "#A1A1AA",
                            fontSize: "14px",
                            lineHeight: "1.5"
                        }}
                    >
                        Submit an issue with mandatory visual proof using either your device camera or by uploading proof files.
                    </p>
                </div>

                {/* ERROR NOTIFICATION */}
                {error && (
                    <div
                        style={{
                            marginBottom: "22px",
                            padding: "14px 18px",
                            borderRadius: "12px",
                            background: "rgba(220, 38, 38, 0.12)",
                            border: "1px solid rgba(220, 38, 38, 0.4)",
                            color: "#FCA5A5",
                            fontSize: "14px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* SUCCESS NOTIFICATION */}
                {message && (
                    <div
                        style={{
                            marginBottom: "22px",
                            padding: "14px 18px",
                            borderRadius: "12px",
                            background: "rgba(16, 185, 129, 0.12)",
                            border: "1px solid rgba(16, 185, 129, 0.4)",
                            color: "#6EE7B7",
                            fontSize: "14px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}
                    >
                        <span>✓</span>
                        <span>{message}</span>
                    </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit}>

                    {/* TITLE */}
                    <div style={fieldStyle}>
                        <label style={labelStyle}>
                            Complaint Title <span style={{ color: "#F5D76E" }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Example: Classroom projector bulb flickering"
                            style={inputStyle}
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div style={fieldStyle}>
                        <label style={labelStyle}>
                            Problem Description <span style={{ color: "#F5D76E" }}>*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide specific details about the issue, symptoms, and urgency..."
                            style={textareaStyle}
                        />
                    </div>

                    {/* LOCATION */}
                    <div style={fieldStyle}>
                        <label style={labelStyle}>
                            Location / Room <span style={{ color: "#F5D76E" }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Example: Science Block B, Room 304"
                            style={inputStyle}
                        />
                    </div>

                    {/* CATEGORY & PRIORITY */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "20px",
                            marginBottom: "26px"
                        }}
                    >
                        {/* CATEGORY */}
                        <div>
                            <label style={labelStyle}>Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="">Auto (AI will categorize)</option>
                                <option value="ELECTRICAL">Electrical</option>
                                <option value="PLUMBING">Plumbing</option>
                                <option value="NETWORK">Network / IT</option>
                                <option value="FURNITURE">Furniture</option>
                                <option value="CIVIL">Civil / Infrastructure</option>
                                <option value="GENERAL">General</option>
                                <option value="GENERAL MAINTENANCE">General Maintenance</option>
                            </select>
                        </div>

                        {/* PRIORITY */}
                        <div>
                            <label style={labelStyle}>Priority</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="">Auto (AI will determine)</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* =================================================
                        PROOF SECTION: CAMERA + UPLOAD PROOF
                    ================================================== */}

                    <div
                        style={{
                            width: "100%",
                            margin: "15px 0 30px",
                            padding: "26px",
                            background: "#121215",
                            border: "1px dashed #3F3F46",
                            borderRadius: "16px",
                            textAlign: "center"
                        }}
                    >
                        {/* SECTION HEADER */}
                        <div style={{ marginBottom: "18px" }}>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    color: "#F5D76E",
                                    fontSize: "18px",
                                    fontWeight: "800"
                                }}
                            >
                                <span>📸</span>
                                <span>Complaint Proof (Required) *</span>
                            </div>
                            <p
                                style={{
                                    margin: "6px 0 0",
                                    color: "#A1A1AA",
                                    fontSize: "13px"
                                }}
                            >
                                Visual proof is mandatory. Choose to take a photo now or upload image files from your device.
                            </p>
                        </div>

                        {/* DUAL ACTION BUTTONS (When neither camera open nor preview ready) */}
                        {!cameraOpen && photoPreviews.length === 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    gap: "14px",
                                    justifyContent: "center",
                                    flexWrap: "wrap",
                                    margin: "10px 0 16px"
                                }}
                            >
                                {/* CAMERA BUTTON */}
                                <button
                                    type="button"
                                    onClick={openCamera}
                                    style={{
                                        ...buttonStyle,
                                        background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
                                        color: "#0B0B0F",
                                        fontWeight: "800",
                                        padding: "13px 26px",
                                        boxShadow: "0 8px 20px rgba(212, 175, 55, 0.25)",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}
                                >
                                    <span>📷</span>
                                    <span>Take Photo</span>
                                </button>

                                {/* UPLOAD PROOF BUTTON */}
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    style={{
                                        ...buttonStyle,
                                        background: "#27272A",
                                        color: "#FFFFFF",
                                        border: "1px solid #3F3F46",
                                        padding: "13px 26px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}
                                >
                                    <span>📁</span>
                                    <span>Upload Proof</span>
                                </button>
                            </div>
                        )}

                        {/* DRAG AND DROP AREA (When no photo selected and camera not open) */}
                        {!cameraOpen && photoPreviews.length === 0 && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={triggerFileInput}
                                style={{
                                    border: isDragging ? "2px dashed #F5D76E" : "1px dashed #3F3F46",
                                    background: isDragging ? "rgba(212, 175, 55, 0.08)" : "rgba(255, 255, 255, 0.02)",
                                    borderRadius: "12px",
                                    padding: "24px 20px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                            >
                                <div style={{ fontSize: "32px", marginBottom: "8px" }}>☁️</div>
                                <p style={{ margin: "0 0 4px", color: "#FFFFFF", fontWeight: "600", fontSize: "14px" }}>
                                    Click or drag & drop proof images here
                                </p>
                                <p style={{ margin: 0, color: "#71717A", fontSize: "12px" }}>
                                    Supported formats: JPG, JPEG, PNG, WEBP (Max 10 MB) • Multiple files supported
                                </p>
                            </div>
                        )}

                        {/* HIDDEN FILE INPUT */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: "none" }}
                        />

                        {/* CAMERA STREAM VIEW */}
                        {cameraOpen && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "12px"
                                }}
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        maxWidth: "680px",
                                        aspectRatio: "16 / 9",
                                        objectFit: "cover",
                                        background: "#020617",
                                        border: "2px solid #3F3F46",
                                        borderRadius: "14px",
                                        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.7)"
                                    }}
                                />

                                {!cameraReady ? (
                                    <p style={{ margin: "6px 0", color: "#F5D76E", fontSize: "13px", fontWeight: "700" }}>
                                        ⏳ Initializing camera stream...
                                    </p>
                                ) : (
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            padding: "6px 14px",
                                            borderRadius: "20px",
                                            background: "rgba(16, 185, 129, 0.16)",
                                            color: "#34D399",
                                            border: "1px solid rgba(16, 185, 129, 0.3)",
                                            fontSize: "12px",
                                            fontWeight: "700"
                                        }}
                                    >
                                        ✓ Camera Ready
                                    </span>
                                )}

                                <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                                    <button
                                        type="button"
                                        disabled={!cameraReady}
                                        onClick={capturePhoto}
                                        style={{
                                            ...buttonStyle,
                                            background: cameraReady
                                                ? "linear-gradient(135deg, #D4AF37, #F5D76E)"
                                                : "#3F3F46",
                                            color: cameraReady ? "#0B0B0F" : "#A1A1AA",
                                            padding: "12px 28px",
                                            boxShadow: cameraReady ? "0 8px 20px rgba(212, 175, 55, 0.25)" : "none"
                                        }}
                                    >
                                        📸 Capture Photo
                                    </button>

                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        style={{
                                            ...buttonStyle,
                                            background: "#27272A",
                                            color: "#E4E4E7",
                                            border: "1px solid #3F3F46"
                                        }}
                                    >
                                        Cancel Camera
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PHOTO PREVIEWS DISPLAY */}
                        {photoPreviews.length > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "14px"
                                }}
                            >
                                {/* MAIN PREVIEW IMAGE */}
                                <div style={{ position: "relative", maxWidth: "680px", width: "100%" }}>
                                    <img
                                        src={photoPreview}
                                        alt="Complaint Proof Preview"
                                        style={{
                                            display: "block",
                                            width: "100%",
                                            maxHeight: "440px",
                                            objectFit: "contain",
                                            background: "#09090B",
                                            border: "1px solid #3F3F46",
                                            borderRadius: "14px"
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "12px",
                                            left: "12px",
                                            padding: "6px 12px",
                                            borderRadius: "8px",
                                            background: "rgba(11, 11, 15, 0.85)",
                                            backdropFilter: "blur(6px)",
                                            border: "1px solid #3F3F46",
                                            color: "#F5D76E",
                                            fontSize: "12px",
                                            fontWeight: "700"
                                        }}
                                    >
                                        {photoPreviews[0]?.source === "camera" ? "📷 Camera Capture" : "📁 Uploaded File"}
                                    </div>
                                </div>

                                {/* MULTIPLE THUMBNAILS (If more than 1 image) */}
                                {photoPreviews.length > 1 && (
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            overflowX: "auto",
                                            maxWidth: "680px",
                                            width: "100%",
                                            padding: "6px 0"
                                        }}
                                    >
                                        {photoPreviews.map((item, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setPhotoPreview(item.url);
                                                    setPhoto(photos[idx]);
                                                }}
                                                style={{
                                                    position: "relative",
                                                    cursor: "pointer",
                                                    borderRadius: "8px",
                                                    overflow: "hidden",
                                                    border: photoPreview === item.url ? "2px solid #F5D76E" : "1px solid #3F3F46",
                                                    flexShrink: 0
                                                }}
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={`Proof thumbnail ${idx + 1}`}
                                                    style={{ width: "70px", height: "50px", objectFit: "cover", display: "block" }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* FILE INFO BADGE */}
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "8px 16px",
                                        borderRadius: "20px",
                                        background: "rgba(16, 185, 129, 0.12)",
                                        border: "1px solid rgba(16, 185, 129, 0.3)",
                                        color: "#34D399",
                                        fontSize: "13px",
                                        fontWeight: "600"
                                    }}
                                >
                                    <span>✓</span>
                                    <span>
                                        {photoPreviews[0]?.name} ({photoPreviews[0]?.size})
                                        {photoPreviews.length > 1 ? ` • ${photoPreviews.length} total images` : ""}
                                    </span>
                                </div>

                                {/* CONTROLS: CHANGE / RETAKE / REMOVE */}
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                                    <button
                                        type="button"
                                        onClick={openCamera}
                                        style={{
                                            ...buttonStyle,
                                            background: "#27272A",
                                            color: "#FFFFFF",
                                            border: "1px solid #3F3F46",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px"
                                        }}
                                    >
                                        <span>📷</span>
                                        <span>Retake via Camera</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={triggerFileInput}
                                        style={{
                                            ...buttonStyle,
                                            background: "#27272A",
                                            color: "#FFFFFF",
                                            border: "1px solid #3F3F46",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "6px"
                                        }}
                                    >
                                        <span>📁</span>
                                        <span>Choose Other File</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => removeProof()}
                                        style={{
                                            ...buttonStyle,
                                            background: "rgba(220, 38, 38, 0.15)",
                                            color: "#FCA5A5",
                                            border: "1px solid rgba(220, 38, 38, 0.3)"
                                        }}
                                    >
                                        ❌ Remove Proof
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HIDDEN CANVAS FOR CAMERA FRAME GRAB */}
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {/* SUBMIT BUTTON */}
                    <button
                        type="submit"
                        disabled={submitting || (!photo && photos.length === 0)}
                        style={{
                            width: "100%",
                            minHeight: "56px",
                            border: "none",
                            borderRadius: "14px",
                            background:
                                submitting || (!photo && photos.length === 0)
                                    ? "#27272A"
                                    : "linear-gradient(135deg, #D4AF37, #F5D76E)",
                            color:
                                submitting || (!photo && photos.length === 0)
                                    ? "#71717A"
                                    : "#0B0B0F",
                            fontSize: "16px",
                            fontWeight: "800",
                            cursor:
                                submitting || (!photo && photos.length === 0)
                                    ? "not-allowed"
                                    : "pointer",
                            boxShadow:
                                submitting || (!photo && photos.length === 0)
                                    ? "none"
                                    : "0 10px 30px rgba(212, 175, 55, 0.3)",
                            transition: "all 0.25s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px"
                        }}
                    >
                        {submitting ? (
                            <span>Submitting Complaint with Proof...</span>
                        ) : !photo && photos.length === 0 ? (
                            <span>📷 Take Photo or 📁 Upload Proof to Submit</span>
                        ) : (
                            <span>🚀 Submit Complaint with Proof</span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateComplaint;