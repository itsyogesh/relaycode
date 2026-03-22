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

        {/* Main content — centered */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            position: "relative",
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#0f0f0f",
              letterSpacing: "-2px",
              lineHeight: 1,
              marginBottom: "16px",
              display: "flex",
            }}
          >
            The Developer Toolkit
          </div>

          {/* Subtitle with gradient "Polkadot" */}
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1,
              marginBottom: "40px",
              display: "flex",
            }}
          >
            <span style={{ color: "#6b7280" }}>for </span>
            <span
              style={{
                background: "linear-gradient(90deg, #FF2670, #7916F3)",
                backgroundClip: "text",
                color: "transparent",
                marginLeft: "12px",
              }}
            >
              Polkadot
            </span>
          </div>

          {/* Tool badges — 2x2 grid */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            {[
              [
                {
                  name: "Contract Studio",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M9 15h6" />
                      <path d="M12 18v-6" />
                    </svg>
                  ),
                },
                {
                  name: "Extrinsic Builder",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3" />
                    </svg>
                  ),
                },
              ],
              [
                {
                  name: "Component Docs",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                    </svg>
                  ),
                },
                {
                  name: "Substrate Utilities",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  ),
                },
              ],
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                {row.map((tool) => (
                  <div
                    key={tool.name}
                    style={{
                      padding: "12px 20px",
                      borderRadius: "100px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      backgroundColor: "rgba(0,0,0,0.02)",
                      color: "#0f0f0f",
                      fontSize: "15px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "220px",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ display: "flex" }}>{tool.name}</span>
                    {tool.icon}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row: website URL at bottom-right */}
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

        {/* Bottom gradient accent bar */}
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
