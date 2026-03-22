import { ImageResponse } from "next/og";
import { loadFonts } from "../fonts";

export const runtime = "edge";

const ICON_PATH =
  "m51 12.804-21-12a5.999 5.999 0 0 0-6 0l-21 12a6 6 0 0 0-3 5.21v24a5.998 5.998 0 0 0 3 5.21l21 12a5.999 5.999 0 0 0 6 0l21-12a5.998 5.998 0 0 0 3-5.21v-24a6 6 0 0 0-3-5.21Zm-24-6.79 9.88 5.65a30.8 30.8 0 0 1-5.25 14.78 37 37 0 0 0-20-11.63L27 6.014ZM6 20.084a31.003 31.003 0 0 1 21.73 11A30.896 30.896 0 0 1 6 40.014v-19.93Zm21 33.93-14.9-8.51a36.893 36.893 0 0 0 19.06-9.4A30.786 30.786 0 0 1 35 49.464l-8 4.55Zm21-12-7.32 4.18a36.752 36.752 0 0 0-5.29-14.74 36.822 36.822 0 0 0 7.14-16.57l5.47 3.13v24Z";

export async function GET() {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          fontFamily: "Nunito",
          position: "relative",
          overflow: "hidden",
          padding: "40px",
        }}
      >
        {/* Subtle dot pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            display: "flex",
          }}
        />

        {/* Top bar: logo at top-left */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <svg width="28" height="31" viewBox="0 0 54 61" fill="none">
              <path d={ICON_PATH} fill="#0f0f0f" />
            </svg>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#0f0f0f",
                letterSpacing: "-0.5px",
                display: "flex",
              }}
            >
              Relaycode
            </span>
          </div>
        </div>

        {/* Main content — split layout */}
        <div
          style={{
            display: "flex",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Left: text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              paddingRight: "40px",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                fontWeight: 700,
                color: "#0f0f0f",
                letterSpacing: "-2px",
                lineHeight: 1.1,
                marginBottom: "16px",
                display: "flex",
              }}
            >
              Docs
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 400,
                color: "#6b7280",
                lineHeight: 1.5,
                maxWidth: "400px",
                display: "flex",
              }}
            >
              Developer documentation for the Relaycode toolkit. Guides,
              references, and examples.
            </div>
          </div>

          {/* Right: docs page mockup */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "460px",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "#fafafa",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
            >
              {/* Sidebar */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "150px",
                  borderRight: "1px solid rgba(0,0,0,0.06)",
                  padding: "20px 14px",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                    display: "flex",
                  }}
                >
                  Getting Started
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#0f0f0f",
                    fontWeight: 700,
                    backgroundColor: "rgba(0,0,0,0.04)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    display: "flex",
                  }}
                >
                  Introduction
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    padding: "4px 8px",
                    display: "flex",
                  }}
                >
                  Installation
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    padding: "4px 8px",
                    display: "flex",
                  }}
                >
                  Quick Start
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginTop: "10px",
                    marginBottom: "4px",
                    display: "flex",
                  }}
                >
                  Builder
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    padding: "4px 8px",
                    display: "flex",
                  }}
                >
                  Pallets
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    padding: "4px 8px",
                    display: "flex",
                  }}
                >
                  Encoding
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginTop: "10px",
                    marginBottom: "4px",
                    display: "flex",
                  }}
                >
                  Studio
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    padding: "4px 8px",
                    display: "flex",
                  }}
                >
                  Contracts
                </span>
              </div>
              {/* Content area */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  padding: "20px 20px",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0f0f0f",
                    display: "flex",
                  }}
                >
                  Introduction
                </span>
                <div
                  style={{
                    height: "8px",
                    width: "100%",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    height: "8px",
                    width: "90%",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    height: "8px",
                    width: "70%",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                    display: "flex",
                  }}
                />
                <div style={{ height: "6px", display: "flex" }} />
                {/* Code block */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "10px 14px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "6px",
                    gap: "3px",
                    fontFamily: "monospace",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ color: "#7916F3", display: "flex" }}>
                    import &#123; DedotClient &#125;
                  </div>
                  <div style={{ color: "#6b7280", display: "flex" }}>
                    &nbsp;&nbsp;from &apos;dedot&apos;;
                  </div>
                </div>
                <div
                  style={{
                    height: "8px",
                    width: "85%",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    height: "8px",
                    width: "55%",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "4px",
                    display: "flex",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: website URL */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            position: "relative",
          }}
        >
          <span
            style={{
              fontSize: "16px",
              fontWeight: 400,
              color: "#9ca3af",
              display: "flex",
            }}
          >
            relaycode.org
          </span>
        </div>

        {/* Bottom gradient bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #FF2670, #7916F3)",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
