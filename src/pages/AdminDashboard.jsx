import { useEffect, useState } from "react";
import api from "../services/api";
import AnalyticsDashboard from "./AnalyticsDashboard";
import NotificationBell from "../components/NotificationBell";
import FixoraLogo from "../components/FixoraLogo";

function AdminDashboard() {

    const [user, setUser] = useState(null);

    const [complaints, setComplaints] =
        useState([]);

    const [technicians, setTechnicians] =
        useState([]);

    const [requests, setRequests] =
        useState([]);

    const [adminFeedbacks, setAdminFeedbacks] =
        useState({});

    const [loading, setLoading] =
        useState(true);

    const [message, setMessage] =
        useState("");


    // ==========================================
    // LOAD ADMIN DATA
    // ==========================================

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

            loadData();

        } catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

            localStorage.removeItem("user");
            localStorage.removeItem("token");

            setLoading(false);
        }

    }, []);


    // ==========================================
    // LOAD DATA
    // ==========================================

    const loadData = async () => {

        try {

            const [
                complaintsResponse,
                techniciansResponse,
                requestsResponse
            ] = await Promise.all([

                api.get(
                    "/admin/complaints"
                ),

                api.get(
                    "/admin/technicians"
                ),

                api.get(
                    "/admin/requests"
                )

            ]);


            const complaintsList = complaintsResponse.data || [];
            setComplaints(complaintsList);

            setTechnicians(
                techniciansResponse.data
            );

            setRequests(
                requestsResponse.data
            );

            // Fetch feedback status for resolved or reopened complaints
            const resolvedList = complaintsList.filter(c =>
                c.status && (c.status.toUpperCase() === "RESOLVED" || c.status.toUpperCase() === "REOPENED")
            );

            const fbMap = {};
            await Promise.all(
                resolvedList.map(async (c) => {
                    try {
                        const fbRes = await api.get(`/complaints/${c.id}/feedback`);
                        if (fbRes.data && fbRes.data.rating) {
                            fbMap[c.id] = fbRes.data;
                        }
                    } catch (_) {}
                })
            );
            setAdminFeedbacks(fbMap);

        } catch (error) {

            console.error(
                "Error loading admin data:",
                error
            );

            setMessage(
                error.response?.data ||
                "Unable to load admin data."
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // APPROVE REQUEST
    // ==========================================

    const approveRequest = async (
        requestId
    ) => {

        try {

            await api.put(
                `/admin/requests/${requestId}/approve`
            );


            setMessage(
                "Request approved successfully."
            );


            loadData();

        } catch (error) {

            console.error(error);

            const serverMessage =
                error.response?.data;

            setMessage(
                typeof serverMessage === "string"
                    ? serverMessage
                    : "Failed to approve request."
            );
        }
    };


    // ==========================================
    // REJECT REQUEST
    // ==========================================

    const rejectRequest = async (
        requestId
    ) => {

        try {

            await api.put(
                `/admin/requests/${requestId}/reject`
            );


            setMessage(
                "Request rejected successfully."
            );


            loadData();

        } catch (error) {

            console.error(error);

            const serverMessage =
                error.response?.data;

            setMessage(
                typeof serverMessage === "string"
                    ? serverMessage
                    : "Failed to reject request."
            );
        }
    };


    // ==========================================
    // ASSIGN TECHNICIAN
    // ==========================================

    const assignTechnician = async (
        complaintId,
        technicianId
    ) => {

        if (!technicianId) {
            return;
        }


        try {

            const response =
                await api.put(
                    `/admin/complaints/${complaintId}/assign/${technicianId}`
                );


            setComplaints(
                previous =>
                    previous.map(
                        complaint =>
                            complaint.id ===
                            complaintId

                                ? response.data

                                : complaint
                    )
            );


            setMessage(
                "Technician assigned successfully."
            );


            // Refresh technician availability

            const techniciansResponse =
                await api.get(
                    "/admin/technicians"
                );

            setTechnicians(
                techniciansResponse.data
            );


        } catch (error) {

            console.error(error);

            const serverMessage =
                error.response?.data;

            setMessage(
                typeof serverMessage === "string"
                    ? serverMessage
                    : "Failed to assign technician."
            );
        }
    };


    // ==========================================
    // LOGOUT
    // ==========================================

    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        window.location.reload();
    };


    // ==========================================
    // STATUS FORMAT
    // ==========================================

    const formatStatus = (
        status
    ) => {

        if (
            status ===
            "IN_PROGRESS"
        ) {

            return "In Progress";
        }


        if (
            status ===
            "PENDING"
        ) {

            return "Pending";
        }


        if (
            status ===
            "RESOLVED"
        ) {

            return "Resolved";
        }


        return status || "Unknown";
    };


    // ==========================================
    // TECHNICIAN SPECIALIZATION FILTER
    // ==========================================

    const getMatchingTechnicians = (
        category
    ) => {

        const normalizedCategory =
            (
                category ||
                "GENERAL"
            )
                .trim()
                .toUpperCase();


        return technicians.filter(
            technician => {

                const specialization =
                    (
                        technician.specialization ||
                        ""
                    )
                        .trim()
                        .toUpperCase();


                if (
                    normalizedCategory ===
                    "GENERAL"
                ) {

                    return (
                        specialization ===
                        "GENERAL" ||

                        specialization ===
                        "GENERAL MAINTENANCE"
                    );
                }


                return (
                    specialization ===
                    normalizedCategory
                );
            }
        );
    };


    // ==========================================
    // STATISTICS
    // ==========================================

    const total =
        complaints.length;


    const pending =
        complaints.filter(
            complaint =>
                complaint.status ===
                "PENDING"
        ).length;


    const inProgress =
        complaints.filter(
            complaint =>
                complaint.status ===
                "IN_PROGRESS"
        ).length;


    const resolved =
        complaints.filter(
            complaint =>
                complaint.status ===
                "RESOLVED"
        ).length;


    // ==========================================
    // LOGIN CHECK
    // ==========================================

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


    // ==========================================
    // ADMIN DASHBOARD
    // ==========================================

    return (

        <div className="admin-dashboard">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="admin-header">

                <div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

                        <FixoraLogo size={36} showText={true} />

                        <span style={{ color: "#3F3F46", fontSize: "22px" }}>|</span>

                        <div>
                            <span style={{ fontSize: "14px", color: "#F5D76E", fontWeight: "750", letterSpacing: "0.04em", display: "block" }}>
                                ADMIN PORTAL
                            </span>
                            <span style={{ fontSize: "12px", color: "#A1A1AA" }}>
                                Institutional Governance &amp; Oversight
                            </span>
                        </div>

                    </div>

                </div>


                <div className="admin-user">


                    <div className="admin-profile">

                        <div className="admin-avatar">

                            {
                                user.name
                                    ? user.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "A"
                            }

                        </div>


                        <div>

                            <span>
                                Administrator
                            </span>

                            <strong>
                                {user.name}
                            </strong>

                        </div>

                    </div>


                    {/* NOTIFICATION BELL */}

                    <NotificationBell />


                    <button
                        className="admin-logout"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* ==================================
                MAIN
            ================================== */}

            <main className="admin-content">


                {/* ==================================
                    PAGE INTRO
                ================================== */}

                <section className="admin-welcome">

                    <div>

                        <span className="admin-welcome-label">
                            ADMIN CONTROL CENTER
                        </span>


                        <h2>
                            Welcome back, {user.name} 👋
                        </h2>


                        <p>
                            Manage complaints, technicians
                            and account requests.
                        </p>

                    </div>


                    <div className="admin-welcome-icon">
                        🛡️
                    </div>

                </section>


                {/* ==================================
                    ANALYTICS
                ================================== */}

                <AnalyticsDashboard />


                {/* ==================================
                    MESSAGE
                ================================== */}

                {message && (

                    <div className="admin-message">

                        <span>
                            ✓
                        </span>

                        {message}


                        <button
                            onClick={() =>
                                setMessage("")
                            }
                        >
                            ×
                        </button>

                    </div>

                )}


                {/* ==================================
                    QUICK STATISTICS
                ================================== */}

                <div className="admin-stats">


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon blue">
                            📋
                        </div>

                        <div>

                            <span>
                                Total Complaints
                            </span>

                            <strong>
                                {total}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon orange">
                            ⏳
                        </div>

                        <div>

                            <span>
                                Pending
                            </span>

                            <strong>
                                {pending}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon purple">
                            🔧
                        </div>

                        <div>

                            <span>
                                In Progress
                            </span>

                            <strong>
                                {inProgress}
                            </strong>

                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="admin-stat-icon green">
                            ✓
                        </div>

                        <div>

                            <span>
                                Resolved
                            </span>

                            <strong>
                                {resolved}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ==================================
                    ROLE REQUESTS
                ================================== */}

                <section className="admin-section">


                    <div className="admin-section-header">

                        <div>

                            <span className="section-label">
                                ACCOUNT MANAGEMENT
                            </span>


                            <h2>
                                👥 Pending Account Requests
                            </h2>


                            <p>
                                Approve or reject new Admin
                                and Technician accounts.
                            </p>

                        </div>


                        <div className="request-count">

                            {requests.length}

                            <span>
                                pending
                            </span>

                        </div>

                    </div>


                    {loading ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ⏳
                            </div>

                            <h3>
                                Loading requests...
                            </h3>

                        </div>


                    ) : requests.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ✓
                            </div>

                            <h3>
                                No pending requests
                            </h3>

                            <p>
                                There are no Admin or Technician
                                requests waiting for approval.
                            </p>

                        </div>


                    ) : (

                        <div className="request-list">

                            {requests.map(
                                request => (

                                    <div
                                        className="request-card"
                                        key={request.id}
                                    >


                                        <div className="request-user-icon">

                                            {
                                                request.requestedRole ===
                                                "TECHNICIAN"
                                                    ? "🔧"
                                                    : "👤"
                                            }

                                        </div>


                                        <div className="request-details">

                                            <h3>
                                                {request.name}
                                            </h3>


                                            <p>
                                                📧 {request.email}
                                            </p>


                                            <div className="request-tags">


                                                <span
                                                    className={
                                                        request.requestedRole ===
                                                        "TECHNICIAN"

                                                            ? "role-tag technician-role"

                                                            : "role-tag admin-role"
                                                    }
                                                >

                                                    {
                                                        request.requestedRole
                                                    }

                                                </span>


                                                {request.requestedRole ===
                                                    "TECHNICIAN" && (

                                                    <span className="specialization-tag">

                                                        🔧{" "}

                                                        {
                                                            request.specialization ||
                                                            "Not specified"
                                                        }

                                                    </span>

                                                )}

                                            </div>


                                            {request.department && (

                                                <small>
                                                    🏢 Department:{" "}
                                                    {request.department}
                                                </small>

                                            )}

                                            <br />


                                            {request.phone && (

                                                <small>
                                                    📞 Phone:{" "}
                                                    {request.phone}
                                                </small>

                                            )}

                                            <br />


                                            <small>

                                                Requested:{" "}

                                                {request.requestedAt

                                                    ? new Date(
                                                        request.requestedAt
                                                    ).toLocaleString()

                                                    : "Not available"}

                                            </small>

                                        </div>


                                        <div className="request-actions">


                                            <button
                                                className="approve-button"
                                                onClick={() =>
                                                    approveRequest(
                                                        request.id
                                                    )
                                                }
                                            >
                                                ✓ Approve
                                            </button>


                                            <button
                                                className="reject-button"
                                                onClick={() =>
                                                    rejectRequest(
                                                        request.id
                                                    )
                                                }
                                            >
                                                ✕ Reject
                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================
                    COMPLAINT MANAGEMENT
                ================================== */}

                <section className="admin-section">


                    <div className="admin-section-header">

                        <div>

                            <span className="section-label">
                                COMPLAINT MANAGEMENT
                            </span>


                            <h2>
                                📋 All Complaints
                            </h2>


                            <p>
                                View complaints, monitor progress and assign technicians.
                            </p>

                        </div>

                    </div>


                    {loading ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ⏳
                            </div>

                            <h3>
                                Loading complaints...
                            </h3>

                        </div>


                    ) : complaints.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📭
                            </div>

                            <h3>
                                No complaints available
                            </h3>

                            <p>
                                Students have not submitted
                                any complaints yet.
                            </p>

                        </div>


                    ) : (

                        <div className="admin-complaint-list">

                            {complaints.map(
                                complaint => (

                                    <div
                                        className="admin-complaint-card"
                                        key={complaint.id}
                                    >


                                        {/* PHOTO */}

                                        <div className="admin-photo">

                                            {complaint.imageUrl ? (

                                                <img
                                                    src={
                                                        `http://localhost:4040${complaint.imageUrl}`
                                                    }
                                                    alt="Complaint"
                                                />

                                            ) : (

                                                <div className="admin-no-photo">

                                                    📷
                                                    <br />
                                                    No Photo

                                                </div>

                                            )}

                                        </div>


                                        {/* DETAILS */}

                                        <div className="admin-complaint-details">


                                            <div className="complaint-title-row">

                                                <div>

                                                    <span className="complaint-id">

                                                        Complaint #{complaint.id}

                                                    </span>


                                                    <h3>
                                                        {complaint.title}
                                                    </h3>

                                                </div>


                                                <span
                                                    className={`status-badge status-${complaint.status?.toLowerCase()}`}
                                                >

                                                    {formatStatus(
                                                        complaint.status
                                                    )}

                                                </span>

                                            </div>


                                            <p className="complaint-description">

                                                {complaint.description}

                                            </p>


                                            <div className="admin-details-grid">


                                                <span>

                                                    <strong>
                                                        👨‍🎓 Student
                                                    </strong>

                                                    {
                                                        complaint.user?.name ||
                                                        "Unknown"
                                                    }

                                                </span>


                                                <span>

                                                    <strong>
                                                        📧 Email
                                                    </strong>

                                                    {
                                                        complaint.user?.email ||
                                                        "Unknown"
                                                    }

                                                </span>


                                                <span>

                                                    <strong>
                                                        📍 Location
                                                    </strong>

                                                    {
                                                        complaint.location ||
                                                        "Not specified"
                                                    }

                                                </span>


                                                <span>

                                                    <strong>
                                                        🤖 Category
                                                    </strong>

                                                    {
                                                        complaint.category ||
                                                        "GENERAL"
                                                    }

                                                </span>


                                                <span>

                                                    <strong>
                                                        ⚡ Priority
                                                    </strong>

                                                    {
                                                        complaint.priority ||
                                                        "MEDIUM"
                                                    }

                                                </span>


                                                <span>

                                                    <strong>
                                                        👨‍🔧 Technician
                                                    </strong>

                                                    {
                                                        complaint
                                                            .technician
                                                            ?.name ||
                                                        "Not assigned"
                                                    }

                                                </span>

                                            </div>


                                            {/* ==================================
                                                CONTROLS
                                            ================================== */}

                                            {/* RESOLVED COMPLAINTS ARE LOCKED */}
                                            {complaint.status?.toUpperCase() !== "RESOLVED" && (

                                                <div className="admin-controls">

                                                    {/* ASSIGN TECHNICIAN */}
                                                    <div>

                                                        <label>
                                                            Assign Technician
                                                        </label>

                                                        <select
                                                            value={
                                                                complaint.technician?.id || ""
                                                            }
                                                            onChange={e =>
                                                                assignTechnician(
                                                                    complaint.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                        >

                                                            <option value="">
                                                                {
                                                                    getMatchingTechnicians(
                                                                        complaint.category
                                                                    ).length === 0
                                                                        ? "No matching technician available"
                                                                        : "Select Technician"
                                                                }
                                                            </option>

                                                            {
                                                                getMatchingTechnicians(
                                                                    complaint.category
                                                                ).map(technician => (
                                                                    <option
                                                                        key={technician.id}
                                                                        value={technician.id}
                                                                    >
                                                                        {technician.name}
                                                                        {" - "}
                                                                        {technician.specialization || "General Maintenance"}
                                                                        {technician.available
                                                                            ? " (Available)"
                                                                            : " (Unavailable)"}
                                                                    </option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>


                                                </div>
                                            )}

                                            {/* RESOLVED MESSAGE */}
                                            {complaint.status?.toUpperCase() === "RESOLVED" && (
                                                <div className="resolved-complaint-message">
                                                    ✓ Complaint resolved — no further changes allowed.
                                                </div>
                                            )}

                                            {/* STUDENT FEEDBACK CARD */}
                                            {adminFeedbacks[complaint.id] ? (
                                                <div style={{
                                                    marginTop: "12px",
                                                    padding: "12px 14px",
                                                    background: "rgba(212, 175, 55, 0.08)",
                                                    border: "1px solid rgba(212, 175, 55, 0.3)",
                                                    borderRadius: "8px",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "6px"
                                                }}>
                                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                                                        <span style={{ color: "#F5D76E", fontWeight: "700", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                            ⭐ Student Feedback: {adminFeedbacks[complaint.id].rating} / 5 Stars
                                                        </span>
                                                        <span style={{ fontSize: "12px", color: adminFeedbacks[complaint.id].issueFixed === "Yes, completely fixed" ? "#4ADE80" : "#F87171", fontWeight: "600" }}>
                                                            {adminFeedbacks[complaint.id].issueFixed}
                                                        </span>
                                                    </div>
                                                    {adminFeedbacks[complaint.id].comment && (
                                                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#E4E4E7", fontStyle: "italic" }}>
                                                            "{adminFeedbacks[complaint.id].comment}"
                                                        </p>
                                                    )}
                                                    {adminFeedbacks[complaint.id].reopenRequested && (
                                                        <span style={{ fontSize: "11px", color: "#EF4444", fontWeight: "700" }}>
                                                            ⚠️ Student requested complaint reopening
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                (complaint.status?.toUpperCase() === "RESOLVED" || complaint.status?.toUpperCase() === "REOPENED") && (
                                                    <div style={{
                                                        marginTop: "8px",
                                                        fontSize: "12px",
                                                        color: "#71717A",
                                                        fontStyle: "italic"
                                                    }}>
                                                        ⏳ No student feedback submitted yet.
                                                    </div>
                                                )
                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;