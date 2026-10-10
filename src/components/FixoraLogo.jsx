import React from "react";

function FixoraLogo({ size = 32, showText = true, textClassName = "", iconOnly = false, className = "" }) {
    const iconSize = size;
    const fontSize = Math.round(size * 0.72);

    return (
        <div
            className={`fixora-logo-container ${className}`}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: Math.round(size * 0.32) + "px",
                textDecoration: "none",
                userSelect: "none"
            }}
        >
            {/* FIXORA F + WRENCH ICON */}
            <div
                className="fixora-logo-icon-wrapper"
                style={{
                    width: iconSize,
                    height: iconSize,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    flexShrink: 0
                }}
            >
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 44 44"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ filter: "drop-shadow(0 2px 8px rgba(212, 175, 55, 0.35))" }}
                >
                    <defs>
                        <linearGradient id="fixoraGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F5D76E" />
                            <stop offset="50%" stopColor="#D4AF37" />
                            <stop offset="100%" stopColor="#A67C00" />
                        </linearGradient>
                        <linearGradient id="fixoraDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#18181B" />
                            <stop offset="100%" stopColor="#0B0B0F" />
                        </linearGradient>
                    </defs>

                    {/* Background squircle with subtle gold border */}
                    <rect
                        x="1.5"
                        y="1.5"
                        width="41"
                        height="41"
                        rx="10"
                        fill="url(#fixoraDarkGrad)"
                        stroke="url(#fixoraGoldGrad)"
                        strokeWidth="1.8"
                    />

                    {/* Integrated 'F' + Wrench Graphic */}
                    {/* Vertical stem of F */}
                    <rect
                        x="10.5"
                        y="9.5"
                        width="5.5"
                        height="25"
                        rx="2.5"
                        fill="url(#fixoraGoldGrad)"
                    />

                    {/* Top wrench arm of F */}
                    <path
                        d="M14 9.5 H28 C29.5 9.5 31 10.5 31.8 11.8 L33.2 13.8 C33.8 14.7 33.6 15.9 32.7 16.5 C31.8 17.1 30.6 16.9 30 16 L28.8 14.5 H14 V9.5 Z"
                        fill="url(#fixoraGoldGrad)"
                    />

                    {/* Wrench head notch detail */}
                    <path
                        d="M26.5 9.5 C26.5 12 28.5 14 31 14 C32 14 32.8 13.6 33.5 13 L35 15 C33.8 16.3 32 17.2 30 17.2 C26.2 17.2 23 14 23 10.2 C23 9.9 23 9.7 23.1 9.5 H26.5 Z"
                        fill="#F5D76E"
                    />

                    {/* Middle bar of F (styled as precision tool tooth) */}
                    <path
                        d="M14 20 H25 C26.4 20 27.5 21.1 27.5 22.5 C27.5 23.9 26.4 25 25 25 H14 V20 Z"
                        fill="url(#fixoraGoldGrad)"
                    />

                    {/* Sparkle / fix accent in bottom right */}
                    <circle cx="32" cy="30" r="2.2" fill="#F5D76E" />
                    <circle cx="28" cy="34" r="1.4" fill="#D4AF37" opacity="0.8" />
                </svg>
            </div>

            {/* BRAND TEXT */}
            {showText && !iconOnly && (
                <div
                    className={`fixora-brand-text ${textClassName}`}
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        letterSpacing: "0.08em",
                        fontWeight: "800",
                        fontSize: fontSize + "px",
                        lineHeight: "1",
                        fontFamily: "'Outfit', 'Inter', sans-serif"
                    }}
                >
                    <span style={{ color: "#FFFFFF" }}>FIX</span>
                    <span
                        style={{
                            background: "linear-gradient(135deg, #F5D76E, #D4AF37)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            textShadow: "0 0 20px rgba(212, 175, 55, 0.4)"
                        }}
                    >
                        ORA
                    </span>
                </div>
            )}
        </div>
    );
}

export default FixoraLogo;
