import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import NotificationBell from "../components/NotificationBell";
import FixoraLogo from "../components/FixoraLogo";

function StudentDashboard({ onNewComplaint }) {

    const [user, setUser] = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================================================
    // EDIT COMPLAINT STATE
    // =========================================================

    const [editingComplaint, setEditingComplaint] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState("");
    const [editSuccess, setEditSuccess] = useState("");

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        location: "",
        category: "",
        priority: ""
    });

    // =========================================================
    // EDIT CAMERA / RETAKE PHOTO STATE
    // =========================================================

    const editVideoRef = useRef(null);
    const editCanvasRef = useRef(null);
    const editStreamRef = useRef(null);
    const editPreviewUrlRef = useRef(null);
    const editFileInputRef = useRef(null);

    const [editCameraOpen, setEditCameraOpen] = useState(false);
    const [editCameraReady, setEditCameraReady] = useState(false);
    const [editPhoto, setEditPhoto] = useState(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState(null);

    // =========================================================
    // STUDENT FEEDBACK STATE
    // =========================================================

    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedbackComplaint, setFeedbackComplaint] = useState(null);
    const [feedbackRating, setFeedbackRating] = useState(5);
    const [feedbackHoverRating, setFeedbackHoverRating] = useState(0);
    const [feedbackIssueFixed, setFeedbackIssueFixed] = useState("Yes, completely fixed");
    const [feedbackComment, setFeedbackComment] = useState("");
    const [feedbackReopen, setFeedbackReopen] = useState(false);
    const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState("");
    const [feedbackError, setFeedbackError] = useState("");
    const [feedbacksMap, setFeedbacksMap] = useState({});


    // =========================================================
    // LOAD USER + COMPLAINTS
    // =========================================================

    useEffect(() => {

        const savedUser =
            localStorage.getItem("user");

        if (!savedUser) {
            setLoading(false);
            return;
        }

        try {

            const loggedUser =
                JSON.parse(savedUser);

            setUser(loggedUser);

            loadComplaints();

        } catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

            localStorage.removeItem("user");
            localStorage.removeItem("token");

            setLoading(false);
        }

        return () => {
            stopEditCamera();

            if (editPreviewUrlRef.current) {
                URL.revokeObjectURL(editPreviewUrlRef.current);
                editPreviewUrlRef.current = null;
            }
        };

    }, []);


    // =========================================================
    // LOAD MY COMPLAINTS
    // =========================================================

    const loadComplaints = async () => {

        try {

            const response =
                await api.get("/complaints/my");

            const complaintsList = response.data || [];
            setComplaints(complaintsList);

            // Fetch feedback status for resolved/reopened complaints
            const resolvedList = complaintsList.filter(c =>
                c.status &&
                (c.status.toUpperCase() === "RESOLVED" || c.status.toUpperCase() === "REOPENED")
            );

            const map = {};
            await Promise.all(
                resolvedList.map(async (c) => {
                    try {
                        const fbRes = await api.get(`/complaints/${c.id}/feedback`);
                        if (fbRes.data && fbRes.data.rating) {
                            map[c.id] = fbRes.data;
                        }
                    } catch (_) {
                        // No feedback yet
                    }
                })
            );

            setFeedbacksMap(map);

        } catch (error) {

            console.error(
                "Error loading complaints:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        window.location.reload();
    };


    // =========================================================
    // FORMAT STATUS
    // =========================================================

    const formatStatus = (status) => {

        if (status === "IN_PROGRESS") {
            return "In Progress";
        }

        if (status === "PENDING") {
            return "Pending";
        }

        if (status === "RESOLVED") {
            return "Resolved";
        }

        if (status === "REOPENED") {
            return "Reopened";
        }

        return status || "Unknown";
    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString();
    };


    // =========================================================
    // STUDENT FEEDBACK HANDLERS
    // =========================================================

    const openFeedbackModal = async (complaint) => {
        setFeedbackComplaint(complaint);
        setFeedbackRating(5);
        setFeedbackHoverRating(0);
        setFeedbackIssueFixed("Yes, completely fixed");
        setFeedbackComment("");
        setFeedbackReopen(false);
        setFeedbackError("");
        setFeedbackSuccess("");
        setFeedbackModalOpen(true);

        try {
            const res = await api.get(`/complaints/${complaint.id}/feedback`);
            if (res.data) {
                setFeedbackRating(res.data.rating || 5);
                setFeedbackIssueFixed(res.data.issueFixed || "Yes, completely fixed");
                setFeedbackComment(res.data.comment || "");
                setFeedbackReopen(res.data.reopenRequested || false);
            }
        } catch (err) {
            // No previous feedback
        }
    };

    const closeFeedbackModal = () => {
        setFeedbackModalOpen(false);
        setFeedbackComplaint(null);
        setFeedbackError("");
        setFeedbackSuccess("");
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setFeedbackError("");
        setFeedbackSuccess("");

        if (!feedbackComplaint) return;

        try {
            setFeedbackSubmitting(true);
            const payload = {
                rating: feedbackRating,
                issueFixed: feedbackIssueFixed,
                comment: feedbackComment.trim(),
                reopenRequested: feedbackIssueFixed === "No, the issue still exists" ? feedbackReopen : false
            };

            const response = await api.post(`/complaints/${feedbackComplaint.id}/feedback`, payload);
            const msg = response.data?.message || "Thank you! Your feedback has been submitted successfully.";
            setFeedbackSuccess(msg);

            setFeedbacksMap(prev => ({
                ...prev,
                [feedbackComplaint.id]: {
                    rating: feedbackRating,
                    issueFixed: feedbackIssueFixed,
                    comment: feedbackComment.trim(),
                    reopenRequested: feedbackIssueFixed === "No, the issue still exists" ? feedbackReopen : false
                }
            }));

            // Refresh complaints
            await loadComplaints();

            setTimeout(() => {
                closeFeedbackModal();
            }, 1800);
        } catch (err) {
            console.error("Feedback submit error:", err);
            const msg = err.response?.data?.message || err.response?.data || "Failed to submit feedback. Please try again.";
            setFeedbackError(typeof msg === "string" ? msg : "Failed to submit feedback.");
        } finally {
            setFeedbackSubmitting(false);
        }
    };


    // =========================================================
    // OPEN EDIT FORM
    // =========================================================

    const handleEditClick = (complaint) => {

        // Only pending complaints can be edited.
        if (
            !complaint.status ||
            complaint.status.toUpperCase() !== "PENDING"
        ) {
            return;
        }

        stopEditCamera();

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(editPreviewUrlRef.current);
            editPreviewUrlRef.current = null;
        }

        setEditingComplaint(complaint);

        setEditForm({
            title: complaint.title || "",
            description: complaint.description || "",
            location: complaint.location || "",
            category: complaint.category || "",
            priority: complaint.priority || ""
        });

        setEditPhoto(null);
        setEditPhotoPreview(null);
        setEditCameraOpen(false);
        setEditCameraReady(false);

        setEditError("");
        setEditSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    // =========================================================
    // CLOSE EDIT FORM
    // =========================================================

    const handleCancelEdit = () => {

        stopEditCamera();

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(editPreviewUrlRef.current);
            editPreviewUrlRef.current = null;
        }

        setEditingComplaint(null);

        setEditPhoto(null);
        setEditPhotoPreview(null);
        setEditCameraOpen(false);
        setEditCameraReady(false);

        setEditForm({
            title: "",
            description: "",
            location: "",
            category: "",
            priority: ""
        });

        setEditError("");
        setEditSuccess("");
    };


    // =========================================================
    // HANDLE EDIT INPUT
    // =========================================================

    const handleEditChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    // =========================================================
    // EDIT CAMERA / RETAKE PHOTO
    // =========================================================

    const openEditCamera = async () => {

        setEditError("");
        setEditSuccess("");
        setEditCameraReady(false);

        try {

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                setEditError(
                    "Camera access is not supported by this browser."
                );
                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        }
                    },
                    audio: false
                });

            editStreamRef.current = stream;
            setEditCameraOpen(true);

            setTimeout(async () => {

                if (!editVideoRef.current) {
                    return;
                }

                editVideoRef.current.srcObject = stream;

                try {
                    await editVideoRef.current.play();
                } catch (error) {
                    console.log(
                        "Edit camera play error:",
                        error
                    );
                }

                setEditCameraReady(true);

            }, 100);

        } catch (error) {

            console.error(
                "Edit camera error:",
                error
            );

            if (error.name === "NotAllowedError") {

                setEditError(
                    "Camera permission was denied. Please allow camera access."
                );

            } else if (error.name === "NotFoundError") {

                setEditError(
                    "No camera was found on this device."
                );

            } else {

                setEditError(
                    "Unable to open the camera. Please try again."
                );
            }
        }
    };


    const stopEditCamera = () => {

        if (editStreamRef.current) {

            editStreamRef.current
                .getTracks()
                .forEach(track => track.stop());

            editStreamRef.current = null;
        }

        if (editVideoRef.current) {
            editVideoRef.current.srcObject = null;
        }

        setEditCameraOpen(false);
        setEditCameraReady(false);
    };


    const captureEditPhoto = () => {

        if (
            !editVideoRef.current ||
            !editCanvasRef.current ||
            !editCameraReady
        ) {
            setEditError(
                "Camera is not ready yet. Please wait a moment."
            );
            return;
        }

        const video = editVideoRef.current;
        const canvas = editCanvasRef.current;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (!width || !height) {
            setEditError(
                "Unable to capture the camera image. Please try again."
            );
            return;
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );

        canvas.toBlob(
            (blob) => {

                if (!blob) {
                    setEditError(
                        "Failed to capture photo."
                    );
                    return;
                }

                const file = new File(
                    [blob],
                    `complaint-retake-${Date.now()}.jpg`,
                    {
                        type: "image/jpeg"
                    }
                );

                if (editPreviewUrlRef.current) {
                    URL.revokeObjectURL(
                        editPreviewUrlRef.current
                    );
                }

                const previewUrl =
                    URL.createObjectURL(blob);

                editPreviewUrlRef.current =
                    previewUrl;

                setEditPhoto(file);
                setEditPhotoPreview(previewUrl);

                setEditSuccess(
                    "New photo captured. It will replace the old photo."
                );

                setEditError("");

                stopEditCamera();
            },
            "image/jpeg",
            0.90
        );
    };


    const retakeEditPhoto = () => {

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(
                editPreviewUrlRef.current
            );

            editPreviewUrlRef.current = null;
        }

        setEditPhoto(null);
        setEditPhotoPreview(null);
        setEditSuccess("");
        setEditError("");

        openEditCamera();
    };


    const keepExistingPhoto = () => {

        stopEditCamera();

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(
                editPreviewUrlRef.current
            );

            editPreviewUrlRef.current = null;
        }

        setEditPhoto(null);
        setEditPhotoPreview(null);

        setEditSuccess(
            "Existing photo will be kept."
        );
    };

    const handleEditFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
            setEditError("Please select a valid image file (JPG, JPEG, PNG, WEBP).");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setEditError("Selected image exceeds 10MB limit.");
            return;
        }

        stopEditCamera();

        if (editPreviewUrlRef.current) {
            URL.revokeObjectURL(editPreviewUrlRef.current);
            editPreviewUrlRef.current = null;
        }

        const previewUrl = URL.createObjectURL(file);
        editPreviewUrlRef.current = previewUrl;

        setEditPhoto(file);
        setEditPhotoPreview(previewUrl);
        setEditError("");
        setEditSuccess(`Selected "${file.name}" as new proof.`);
    };


    // =========================================================
    // SAVE EDITED COMPLAINT
    // =========================================================

    const handleUpdateComplaint = async (event) => {

        event.preventDefault();

        setEditError("");
        setEditSuccess("");

        if (!editingComplaint) {
            return;
        }

        if (
            String(editingComplaint.status || "").toUpperCase() !==
            "PENDING"
        ) {
            setEditError(
                "Only pending complaints can be edited."
            );
            return;
        }

        if (!editForm.title.trim()) {
            setEditError(
                "Complaint title is required."
            );
            return;
        }

        if (!editForm.description.trim()) {
            setEditError(
                "Complaint description is required."
            );
            return;
        }

        if (!editForm.location.trim()) {
            setEditError(
                "Complaint location is required."
            );
            return;
        }

        try {

            setEditLoading(true);

            /*
             * Multipart request:
             *
             * image is OPTIONAL during edit.
             * - No retake -> backend keeps existing image.
             * - Retake -> backend replaces existing image.
             */

            const formData = new FormData();

            formData.append(
                "title",
                editForm.title.trim()
            );

            formData.append(
                "description",
                editForm.description.trim()
            );

            formData.append(
                "location",
                editForm.location.trim()
            );

            if (editForm.category) {
                formData.append(
                    "category",
                    editForm.category
                );
            }

            if (editForm.priority) {
                formData.append(
                    "priority",
                    editForm.priority
                );
            }

            if (editPhoto) {
                formData.append(
                    "image",
                    editPhoto
                );
            }

            const response =
                await api.put(
                    `/complaints/${editingComplaint.id}`,
                    formData
                );

            setComplaints((previous) =>
                previous.map((complaint) =>
                    complaint.id === editingComplaint.id
                        ? response.data
                        : complaint
                )
            );

            setEditSuccess(
                editPhoto
                    ? "Complaint and photo updated successfully!"
                    : "Complaint updated successfully!"
            );

            setTimeout(() => {
                handleCancelEdit();
            }, 1200);

        } catch (error) {

            console.error(
                "Error updating complaint:",
                error
            );

            let message =
                "Unable to update complaint.";

            if (
                error.response &&
                error.response.data
            ) {

                if (
                    typeof error.response.data ===
                    "string"
                ) {

                    message =
                        error.response.data;

                } else if (
                    error.response.data.message
                ) {

                    message =
                        error.response.data.message;
                }
            }

            setEditError(message);

        } finally {

            setEditLoading(false);
        }
    };


    // =========================================================
    // LOGIN CHECK
    // =========================================================

    if (!user) {

        return (
            <div className="dashboard">

                <div className="empty-state">

                    <h2>
                        Please login first.
                    </h2>

                </div>

            </div>
        );
    }


    // =========================================================
    // DASHBOARD
    // =========================================================

    return (

        <div className="dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="dashboard-header">

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

                    <FixoraLogo size={32} showText={true} />

                    <span style={{ color: "#3F3F46", fontSize: "20px" }}>|</span>

                    <p style={{ margin: 0, fontSize: "14px", color: "#A1A1AA", fontWeight: "600" }}>
                        Student Dashboard
                    </p>

                </div>


                <div className="user-info">

                    <span>
                        Welcome,{" "}

                        <strong>
                            {user.name}
                        </strong>
                    </span>


                    {/* NOTIFICATION BELL */}

                    <NotificationBell />


                    <button
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard-content">


                {/* =================================================
                    EDIT COMPLAINT FORM
                ================================================= */}

                {editingComplaint && (

                    <section
                        className="complaints-section edit-complaint-section"
                        style={{
                            marginBottom: "30px"
                        }}
                    >

                        <div className="section-header">

                            <h2>
                                ✏️ Edit Complaint
                            </h2>

                            <button
                                className="secondary-button"
                                onClick={
                                    handleCancelEdit
                                }
                                type="button"
                            >
                                ✕ Cancel
                            </button>

                        </div>


                        {/* COMPLAINT ID */}

                        <p
                            style={{
                                marginBottom: "20px"
                            }}
                        >
                            Editing Complaint #
                            {editingComplaint.id}
                        </p>


                        {/* SUCCESS */}

                        {editSuccess && (

                            <div
                                className="success-message"
                                style={{
                                    padding: "12px",
                                    marginBottom: "15px",
                                    borderRadius: "8px"
                                }}
                            >
                                {editSuccess}
                            </div>

                        )}


                        {/* ERROR */}

                        {editError && (

                            <div
                                className="error-message"
                                style={{
                                    padding: "12px",
                                    marginBottom: "15px",
                                    borderRadius: "8px"
                                }}
                            >
                                {editError}
                            </div>

                        )}


                        <form
                            onSubmit={
                                handleUpdateComplaint
                            }
                        >

                            {/* TITLE */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "18px"
                                }}
                            >

                                <label>
                                    Complaint Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={
                                        editForm.title
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    placeholder="Enter complaint title"
                                    disabled={editLoading}
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "18px"
                                }}
                            >

                                <label>
                                    Problem Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        editForm.description
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    placeholder="Describe the problem"
                                    rows="5"
                                    disabled={editLoading}
                                />

                            </div>


                            {/* LOCATION */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "18px"
                                }}
                            >

                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        editForm.location
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    placeholder="Enter location"
                                    disabled={editLoading}
                                />

                            </div>


                            {/* CATEGORY */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "18px"
                                }}
                            >

                                <label>
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={
                                        editForm.category
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={editLoading}
                                >

                                    <option value="">
                                        Auto Detect
                                    </option>

                                    <option value="ELECTRICAL">
                                        Electrical
                                    </option>

                                    <option value="PLUMBING">
                                        Plumbing
                                    </option>

                                    <option value="NETWORK">
                                        Network
                                    </option>

                                    <option value="FURNITURE">
                                        Furniture
                                    </option>

                                    <option value="CIVIL">
                                        Civil
                                    </option>

                                    <option value="GENERAL">
                                        General
                                    </option>

                                </select>

                            </div>


                            {/* PRIORITY */}

                            <div
                                className="form-group"
                                style={{
                                    marginBottom: "20px"
                                }}
                            >

                                <label>
                                    Priority
                                </label>

                                <select
                                    name="priority"
                                    value={
                                        editForm.priority
                                    }
                                    onChange={
                                        handleEditChange
                                    }
                                    disabled={editLoading}
                                >

                                    <option value="">
                                        Auto Detect
                                    </option>

                                    <option value="LOW">
                                        Low
                                    </option>

                                    <option value="MEDIUM">
                                        Medium
                                    </option>

                                    <option value="HIGH">
                                        High
                                    </option>

                                    <option value="URGENT">
                                        Urgent
                                    </option>

                                </select>

                            </div>


                            {/* =================================================
                                EXISTING PHOTO / RETAKE PHOTO
                            ================================================= */}

                            <div
                                className="edit-photo-section"
                                style={{
                                    marginTop: "22px",
                                    marginBottom: "24px",
                                    padding: "22px",
                                    border:
                                        "1px solid rgba(107,169,216,.25)",
                                    borderRadius: "14px",
                                    background:
                                        "rgba(16,39,64,.55)"
                                }}
                            >

                                <h3
                                    style={{
                                        marginTop: 0
                                    }}
                                >
                                    📷 Complaint Photo
                                </h3>

                                <p
                                    style={{
                                        color: "#91a8c0"
                                    }}
                                >
                                    You can keep the current photo
                                    or retake it.
                                </p>


                                {/* CURRENT PHOTO */}

                                {!editPhotoPreview &&
                                    editingComplaint.imageUrl && (

                                    <div
                                        style={{
                                            marginBottom: "18px"
                                        }}
                                    >

                                        <p>
                                            Current Photo
                                        </p>

                                        <img
                                            src={
                                                `http://localhost:4040${editingComplaint.imageUrl}`
                                            }
                                            alt="Current complaint"
                                            style={{
                                                width: "220px",
                                                height: "145px",
                                                objectFit: "cover",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid rgba(255,255,255,.15)"
                                            }}
                                        />

                                    </div>

                                )}


                                {/* CAMERA */}

                                {editCameraOpen && (

                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "center",
                                            gap: "12px",
                                            marginBottom:
                                                "18px"
                                        }}
                                    >

                                        <video
                                            ref={editVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            style={{
                                                width: "100%",
                                                maxWidth:
                                                    "720px",
                                                aspectRatio:
                                                    "16 / 9",
                                                objectFit:
                                                    "cover",
                                                background:
                                                    "#020617",
                                                border:
                                                    "3px solid #ffffff",
                                                borderRadius:
                                                    "12px"
                                            }}
                                        />


                                        {!editCameraReady && (

                                            <p>
                                                Camera is starting...
                                            </p>

                                        )}


                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap: "10px",
                                                flexWrap:
                                                    "wrap",
                                                justifyContent:
                                                    "center"
                                            }}
                                        >

                                            <button
                                                type="button"
                                                className="primary-button"
                                                disabled={
                                                    !editCameraReady ||
                                                    editLoading
                                                }
                                                onClick={
                                                    captureEditPhoto
                                                }
                                            >
                                                📸 Capture New Photo
                                            </button>


                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={
                                                    stopEditCamera
                                                }
                                                disabled={
                                                    editLoading
                                                }
                                            >
                                                Cancel Camera
                                            </button>

                                        </div>

                                    </div>

                                )}


                                {/* NEW PHOTO PREVIEW */}

                                {editPhotoPreview && (

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            flexDirection:
                                                "column",
                                            alignItems:
                                                "flex-start",
                                            gap: "10px",
                                            marginBottom:
                                                "18px"
                                        }}
                                    >

                                        <p
                                            style={{
                                                color:
                                                    "#4ade80",
                                                fontWeight:
                                                    "700"
                                            }}
                                        >
                                            ✓ New photo selected
                                        </p>


                                        <img
                                            src={
                                                editPhotoPreview
                                            }
                                            alt="New complaint photo"
                                            style={{
                                                width: "220px",
                                                height: "145px",
                                                objectFit:
                                                    "cover",
                                                borderRadius:
                                                    "10px"
                                            }}
                                        />


                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap: "10px",
                                                flexWrap:
                                                    "wrap"
                                            }}
                                        >

                                            <button
                                                type="button"
                                                className="primary-button"
                                                onClick={
                                                    retakeEditPhoto
                                                }
                                                disabled={
                                                    editLoading
                                                }
                                            >
                                                🔄 Retake via Camera
                                            </button>

                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={() =>
                                                    editFileInputRef.current?.click()
                                                }
                                                disabled={
                                                    editLoading
                                                }
                                            >
                                                📁 Choose Other File
                                            </button>

                                            <button
                                                type="button"
                                                className="secondary-button"
                                                onClick={
                                                    keepExistingPhoto
                                                }
                                                disabled={
                                                    editLoading
                                                }
                                            >
                                                Keep Existing Photo
                                            </button>

                                        </div>

                                    </div>

                                )}


                                {/* OPEN CAMERA OR UPLOAD PROOF */}

                                {!editCameraOpen &&
                                    !editPhotoPreview && (

                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            flexWrap: "wrap",
                                            alignItems: "center"
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className="primary-button"
                                            onClick={
                                                openEditCamera
                                            }
                                            disabled={
                                                editLoading
                                            }
                                        >
                                            📷 Retake Photo
                                        </button>

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={() =>
                                                editFileInputRef.current?.click()
                                            }
                                            disabled={
                                                editLoading
                                            }
                                        >
                                            📁 Upload Proof
                                        </button>

                                        <input
                                            ref={editFileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            onChange={handleEditFileSelect}
                                            style={{ display: "none" }}
                                        />
                                    </div>

                                )}


                                <canvas
                                    ref={editCanvasRef}
                                    style={{
                                        display: "none"
                                    }}
                                />

                            </div>


                            {/* BUTTONS */}

                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    marginTop: "20px"
                                }}
                            >

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={
                                        editLoading
                                    }
                                >

                                    {editLoading
                                        ? "Saving..."
                                        : "💾 Save Changes"}

                                </button>


                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                    disabled={
                                        editLoading
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </section>

                )}


                {/* =================================================
                    WELCOME
                ================================================= */}

                <div className="welcome-card">

                    <h2>
                        Welcome to Fixora 👋
                    </h2>

                    <p>
                        Report campus problems and
                        track your complaints.
                    </p>

                </div>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="dashboard-grid">


                    {/* TOTAL */}

                    <div className="stat-card">

                        <h3>
                            Total Complaints
                        </h3>

                        <p>
                            {complaints.length}
                        </p>

                    </div>


                    {/* PENDING */}

                    <div className="stat-card">

                        <h3>
                            Pending
                        </h3>

                        <p>

                            {
                                complaints.filter(
                                    complaint =>
                                        complaint.status ===
                                        "PENDING"
                                ).length
                            }

                        </p>

                    </div>


                    {/* IN PROGRESS */}

                    <div className="stat-card">

                        <h3>
                            In Progress
                        </h3>

                        <p>

                            {
                                complaints.filter(
                                    complaint =>
                                        complaint.status ===
                                        "IN_PROGRESS"
                                ).length
                            }

                        </p>

                    </div>


                    {/* RESOLVED */}

                    <div className="stat-card">

                        <h3>
                            Resolved
                        </h3>

                        <p>

                            {
                                complaints.filter(
                                    complaint =>
                                        complaint.status ===
                                        "RESOLVED"
                                ).length
                            }

                        </p>

                    </div>

                </div>


                {/* =================================================
                    MY COMPLAINTS
                ================================================= */}

                <section className="complaints-section">


                    {/* SECTION HEADER */}

                    <div className="section-header">

                        <h2>
                            My Complaints
                        </h2>


                        {complaints.length > 0 && (

                            <button
                                className="primary-button"
                                onClick={
                                    onNewComplaint
                                }
                            >
                                + New Complaint
                            </button>

                        )}

                    </div>


                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (

                        <div className="empty-state">

                            <h3>
                                Loading complaints...
                            </h3>

                        </div>


                    ) : complaints.length === 0 ? (


                        /* =================================================
                            NO COMPLAINTS
                        ================================================= */

                        <div className="empty-state">

                            <div className="empty-state-icon">
                                📷
                            </div>

                            <div className="empty-state-content">

                                <h3>
                                    No complaints yet
                                </h3>

                                <p>
                                    Have a campus issue?
                                    Report it here and we'll
                                    help get it resolved.
                                </p>

                                <button
                                    className="empty-state-button"
                                    onClick={
                                        onNewComplaint
                                    }
                                >

                                    <span className="button-icon">
                                        📷
                                    </span>

                                    Report a Campus Problem

                                </button>

                            </div>

                        </div>


                    ) : (


                        /* =================================================
                            COMPLAINT LIST
                        ================================================= */

                        <div className="complaint-list">

                            {complaints.map(
                                complaint => (

                                    <div
                                        className="complaint-card"
                                        key={
                                            complaint.id
                                        }
                                    >


                                        {/* =================================================
                                            PHOTO + INFORMATION
                                        ================================================= */}

                                        <div className="complaint-info">


                                            {/* PHOTO */}

                                            {complaint.imageUrl ? (

                                                <img
                                                    src={
                                                        `http://localhost:4040${complaint.imageUrl}`
                                                    }
                                                    alt="Complaint"
                                                    className="complaint-image"
                                                />

                                            ) : (

                                                <div className="no-photo">

                                                    📷
                                                    <br />
                                                    No Photo

                                                </div>

                                            )}


                                            {/* DETAILS */}

                                            <div className="complaint-details">

                                                <h3>
                                                    {
                                                        complaint.title
                                                    }
                                                </h3>


                                                <p>
                                                    {
                                                        complaint.description
                                                    }
                                                </p>


                                                <small>

                                                    📍 Location:{" "}

                                                    {
                                                        complaint.location
                                                    }

                                                </small>

                                                <br />


                                                <small>

                                                    🆔 Complaint ID: #

                                                    {
                                                        complaint.id
                                                    }

                                                </small>

                                                <br />


                                                <small>

                                                    🕒 Submitted:{" "}

                                                    {
                                                        formatDate(
                                                            complaint.createdAt
                                                        )
                                                    }

                                                </small>


                                                {/* UPDATED */}

                                                {complaint.updatedAt && (

                                                    <>

                                                        <br />

                                                        <small>

                                                            🔄 Updated:{" "}

                                                            {
                                                                formatDate(
                                                                    complaint.updatedAt
                                                                )
                                                            }

                                                        </small>

                                                    </>

                                                )}


                                                {/* TECHNICIAN */}

                                                {complaint.technician && (

                                                    <>

                                                        <br />

                                                        <small>

                                                            👨‍🔧 Technician:{" "}

                                                            {
                                                                complaint
                                                                    .technician
                                                                    .name
                                                            }

                                                        </small>

                                                    </>

                                                )}

                                            </div>

                                        </div>


                                        {/* =================================================
                                            COMPLAINT META
                                        ================================================= */}

                                        <div className="complaint-meta">


                                            {/* CATEGORY */}

                                            <span className="category">

                                                Category:{" "}

                                                {
                                                    complaint.category ||
                                                    "GENERAL"
                                                }

                                            </span>


                                            {/* PRIORITY */}

                                            <span className="priority">

                                                Priority:{" "}

                                                {
                                                    complaint.priority ||
                                                    "MEDIUM"
                                                }

                                            </span>


                                            {/* STATUS */}

                                            <span className="status">

                                                Status:{" "}

                                                {
                                                    formatStatus(
                                                        complaint.status
                                                    )
                                                }

                                            </span>


                                            {/* TECHNICIAN ASSIGNED */}

                                            {complaint.technician && (

                                                <span className="technician">

                                                    Assigned

                                                </span>

                                            )}


                                            {/* =================================================
                                                EDIT BUTTON
                                            ================================================= */}

                                            {complaint.status &&
                                                complaint.status.toUpperCase() ===
                                                "PENDING" && (

                                                    <button
                                                        type="button"
                                                        className="edit-complaint-button"
                                                        onClick={() =>
                                                            handleEditClick(
                                                                complaint
                                                             )
                                                        }
                                                    >
                                                        ✏️ Edit / Change
                                                    </button>

                                                )}

                                            {/* FEEDBACK BUTTON / STATUS */}
                                            {complaint.status &&
                                                (complaint.status.toUpperCase() === "RESOLVED" ||
                                                 complaint.status.toUpperCase() === "REOPENED") ? (

                                                feedbacksMap[complaint.id] ? (
                                                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                                        <span
                                                            style={{
                                                                background: "rgba(212, 175, 55, 0.15)",
                                                                color: "#F5D76E",
                                                                border: "1px solid rgba(212, 175, 55, 0.35)",
                                                                borderRadius: "8px",
                                                                padding: "6px 12px",
                                                                fontSize: "12px",
                                                                fontWeight: "700",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "5px"
                                                            }}
                                                        >
                                                            ★ {feedbacksMap[complaint.id].rating}/5 Feedback Submitted
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => openFeedbackModal(complaint)}
                                                            style={{
                                                                background: "transparent",
                                                                color: "#D4AF37",
                                                                border: "1px solid #D4AF37",
                                                                borderRadius: "8px",
                                                                padding: "6px 12px",
                                                                fontSize: "12px",
                                                                fontWeight: "650",
                                                                cursor: "pointer",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "4px"
                                                            }}
                                                        >
                                                            ✏️ Edit Feedback
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openFeedbackModal(
                                                                complaint
                                                            )
                                                        }
                                                        style={{
                                                            background: "linear-gradient(135deg, #D4AF37, #F5D76E)",
                                                            color: "#0B0B0F",
                                                            border: "none",
                                                            borderRadius: "8px",
                                                            padding: "8px 15px",
                                                            fontSize: "13px",
                                                            fontWeight: "750",
                                                            cursor: "pointer",
                                                            boxShadow: "0 4px 12px rgba(212, 175, 55, 0.25)",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "6px"
                                                        }}
                                                    >
                                                        ⭐ Give Feedback
                                                    </button>
                                                )

                                            ) : (

                                                <span
                                                    style={{
                                                        fontSize: "12px",
                                                        color: "#A1A1AA",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "5px",
                                                        background: "rgba(255, 255, 255, 0.04)",
                                                        border: "1px dashed #3F3F46",
                                                        padding: "6px 12px",
                                                        borderRadius: "8px"
                                                    }}
                                                    title="Student feedback unlocks once this complaint is marked resolved"
                                                >
                                                    🔒 Feedback opens upon resolution
                                                </span>

                                            )}

                                        </div>


                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

            {/* =========================================================
                STUDENT FEEDBACK MODAL
            ========================================================= */}
            {feedbackModalOpen && feedbackComplaint && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.8)",
                        backdropFilter: "blur(6px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 9999,
                        padding: "20px"
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !feedbackSubmitting) {
                            closeFeedbackModal();
                        }
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "520px",
                            background: "#18181B",
                            border: "1px solid #3F3F46",
                            borderRadius: "18px",
                            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.8)",
                            padding: "32px 30px",
                            color: "#FFFFFF",
                            position: "relative"
                        }}
                    >
                        {/* CLOSE BUTTON */}
                        <button
                            type="button"
                            onClick={closeFeedbackModal}
                            disabled={feedbackSubmitting}
                            style={{
                                position: "absolute",
                                top: "18px",
                                right: "18px",
                                background: "none",
                                border: "none",
                                color: "#A1A1AA",
                                fontSize: "20px",
                                cursor: "pointer",
                                padding: "4px 8px"
                            }}
                        >
                            ✕
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "24px" }}>⭐</span>
                            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#FFFFFF" }}>
                                Complaint Feedback
                            </h2>
                        </div>
                        <p style={{ margin: "0 0 20px", color: "#A1A1AA", fontSize: "13px" }}>
                            Complaint #{feedbackComplaint.id}: "{feedbackComplaint.title}"
                        </p>

                        {feedbackError && (
                            <div
                                style={{
                                    marginBottom: "16px",
                                    padding: "11px 14px",
                                    borderRadius: "10px",
                                    background: "rgba(220, 38, 38, 0.15)",
                                    border: "1px solid rgba(220, 38, 38, 0.35)",
                                    color: "#FCA5A5",
                                    fontSize: "13px",
                                    fontWeight: "600"
                                }}
                            >
                                ⚠️ {feedbackError}
                            </div>
                        )}

                        {feedbackSuccess && (
                            <div
                                style={{
                                    marginBottom: "16px",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    background: "rgba(16, 185, 129, 0.15)",
                                    border: "1px solid rgba(16, 185, 129, 0.35)",
                                    color: "#6EE7B7",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    textAlign: "center"
                                }}
                            >
                                ✓ {feedbackSuccess}
                            </div>
                        )}

                        <form onSubmit={handleFeedbackSubmit}>
                            {/* RATING */}
                            <div style={{ marginBottom: "20px", textAlign: "center" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "14px" }}>
                                    How would you rate the resolution? *
                                </label>
                                <div style={{ display: "inline-flex", gap: "8px", fontSize: "32px", cursor: "pointer" }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            onMouseEnter={() => setFeedbackHoverRating(star)}
                                            onMouseLeave={() => setFeedbackHoverRating(0)}
                                            onClick={() => setFeedbackRating(star)}
                                            style={{
                                                color: (feedbackHoverRating || feedbackRating) >= star ? "#F5D76E" : "#3F3F46",
                                                transition: "transform 0.15s ease",
                                                transform: (feedbackHoverRating || feedbackRating) >= star ? "scale(1.15)" : "scale(1)"
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                                <div style={{ color: "#D4AF37", fontSize: "12px", fontWeight: "700", marginTop: "4px" }}>
                                    {feedbackRating === 5 && "Excellent (5/5)"}
                                    {feedbackRating === 4 && "Good (4/5)"}
                                    {feedbackRating === 3 && "Average (3/5)"}
                                    {feedbackRating === 2 && "Poor (2/5)"}
                                    {feedbackRating === 1 && "Very Poor (1/5)"}
                                </div>
                            </div>

                            {/* WAS ISSUE FIXED PROPERLY */}
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "14px" }}>
                                    Was the issue fixed properly? *
                                </label>
                                <select
                                    value={feedbackIssueFixed}
                                    onChange={(e) => setFeedbackIssueFixed(e.target.value)}
                                    style={{
                                        width: "100%",
                                        height: "46px",
                                        padding: "0 12px",
                                        borderRadius: "10px",
                                        background: "#121215",
                                        border: "1px solid #3F3F46",
                                        color: "#FFFFFF",
                                        fontSize: "14px",
                                        outline: "none"
                                    }}
                                >
                                    <option value="Yes, completely fixed">Yes, completely fixed</option>
                                    <option value="Partially fixed">Partially fixed</option>
                                    <option value="No, the issue still exists">No, the issue still exists</option>
                                </select>
                            </div>

                            {/* ACTION REQUIRED & REOPEN OPTION */}
                            {feedbackIssueFixed === "No, the issue still exists" && (
                                <div
                                    style={{
                                        marginBottom: "20px",
                                        padding: "16px",
                                        borderRadius: "12px",
                                        background: "rgba(220, 38, 38, 0.10)",
                                        border: "1px solid rgba(220, 38, 38, 0.35)"
                                    }}
                                >
                                    <div style={{ color: "#FCA5A5", fontWeight: "800", fontSize: "13px", marginBottom: "6px" }}>
                                        ⚠️ ACTION REQUIRED
                                    </div>
                                    <p style={{ margin: "0 0 12px", color: "#E4E4E7", fontSize: "13px" }}>
                                        The student reported that the issue is still not resolved. You can request to reopen this complaint for administrative review.
                                    </p>
                                    <label
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            fontWeight: "700",
                                            color: "#F5D76E"
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={feedbackReopen}
                                            onChange={(e) => setFeedbackReopen(e.target.checked)}
                                            style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#D4AF37" }}
                                        />
                                        <span>Reopen this complaint (Status will change to Reopened)</span>
                                    </label>
                                </div>
                            )}

                            {/* STUDENT COMMENT */}
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", fontSize: "14px" }}>
                                    Student Comment (Optional)
                                </label>
                                <textarea
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                    placeholder="Add any details about how the repair went or why it's not resolved..."
                                    style={{
                                        width: "100%",
                                        minHeight: "90px",
                                        padding: "12px",
                                        borderRadius: "10px",
                                        background: "#121215",
                                        border: "1px solid #3F3F46",
                                        color: "#FFFFFF",
                                        fontSize: "14px",
                                        outline: "none",
                                        resize: "vertical"
                                    }}
                                />
                            </div>

                            {/* ACTION BUTTONS */}
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    type="submit"
                                    disabled={feedbackSubmitting}
                                    style={{
                                        flex: 1,
                                        height: "48px",
                                        border: "none",
                                        borderRadius: "10px",
                                        background: feedbackSubmitting
                                            ? "#3F3F46"
                                            : "linear-gradient(135deg, #D4AF37, #F5D76E)",
                                        color: feedbackSubmitting ? "#A1A1AA" : "#0B0B0F",
                                        fontWeight: "800",
                                        fontSize: "15px",
                                        cursor: feedbackSubmitting ? "not-allowed" : "pointer",
                                        boxShadow: "0 8px 20px rgba(212, 175, 55, 0.25)"
                                    }}
                                >
                                    {feedbackSubmitting ? "Submitting Feedback..." : "Submit Feedback"}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeFeedbackModal}
                                    disabled={feedbackSubmitting}
                                    style={{
                                        height: "48px",
                                        padding: "0 20px",
                                        background: "#27272A",
                                        border: "1px solid #3F3F46",
                                        borderRadius: "10px",
                                        color: "#FFFFFF",
                                        fontWeight: "700",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default StudentDashboard;