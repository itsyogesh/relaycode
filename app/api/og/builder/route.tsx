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
              Builder
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
              Visual extrinsic builder for the Polkadot ecosystem. Build,
              encode, and submit any pallet call.
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "24px",
              }}
            >
              {["All Pallets", "All Chains", "SCALE Codec"].map((tech) => (
                <div
                  key={tech}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(0,0,0,0.12)",
                    color: "#0f0f0f",
                    fontSize: "14px",
                    fontWeight: 700,
                    display: "flex",
                  }}
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>

          {/* Right: builder form mockup */}
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
                flexDirection: "column",
                width: "100%",
                borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.08)",
                backgroundColor: "#fafafa",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 20px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#0f0f0f",
                    display: "flex",
                  }}
                >
                  Extrinsic Builder
                </span>
              </div>
              {/* Form rows */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "20px",
                  gap: "14px",
                }}
              >
                {[
                  { label: "Section", value: "balances", mono: false },
                  { label: "Method", value: "transferKeepAlive", mono: false },
                  { label: "dest", value: "5GrwvaEF5z...", mono: true },
                  { label: "value", value: "10.0 DOT", mono: false },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        display: "flex",
                      }}
                    >
                      {row.label}
                    </span>
                    <div
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.08)",
                        backgroundColor: "#ffffff",
                        fontSize: row.mono ? "12px" : "13px",
                        color: row.mono ? "#9ca3af" : "#0f0f0f",
                        fontFamily: row.mono ? "monospace" : "Nunito",
                        fontWeight: row.mono ? 400 : 700,
                        display: "flex",
                        width: "220px",
                      }}
                    >
                      {row.value}
                    </div>
                  </div>
                ))}
                {/* Submit button — black */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "4px",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 24px",
                      borderRadius: "8px",
                      backgroundColor: "#0f0f0f",
                      color: "white",
                      fontSize: "13px",
                      fontWeight: 700,
                      display: "flex",
                    }}
                  >
                    Sign and Submit
                  </div>
                </div>
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
