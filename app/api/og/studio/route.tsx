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
              Studio
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
              Smart contract IDE for Polkadot Hub. Write Solidity, compile to
              PVM, deploy from your browser.
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "24px",
              }}
            >
              {["Solidity", "EVM", "PVM", "PolkaVM"].map((tech) => (
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

          {/* Right: code editor mockup */}
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
              {/* Title bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ff5f57",
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#febc2e",
                    display: "flex",
                  }}
                />
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#28c840",
                    display: "flex",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    marginLeft: "8px",
                    display: "flex",
                  }}
                >
                  Contract.sol
                </span>
              </div>
              {/* Code lines */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "16px 20px",
                  gap: "4px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                }}
              >
                <div style={{ color: "#9ca3af", display: "flex" }}>
                  // SPDX-License-Identifier: MIT
                </div>
                <div style={{ color: "#7916F3", display: "flex" }}>
                  pragma solidity ^0.8.20;
                </div>
                <div style={{ display: "flex", height: "14px" }} />
                <div style={{ display: "flex" }}>
                  <span style={{ color: "#7916F3" }}>contract</span>
                  <span style={{ color: "#FF2670", marginLeft: "6px" }}>
                    MyToken
                  </span>
                  <span style={{ color: "#6b7280", marginLeft: "6px" }}>
                    is ERC20 &#123;
                  </span>
                </div>
                <div
                  style={{
                    color: "#6b7280",
                    paddingLeft: "20px",
                    display: "flex",
                  }}
                >
                  string public name;
                </div>
                <div
                  style={{
                    color: "#6b7280",
                    paddingLeft: "20px",
                    display: "flex",
                  }}
                >
                  uint256 public totalSupply;
                </div>
                <div style={{ display: "flex", height: "14px" }} />
                <div style={{ display: "flex", paddingLeft: "20px" }}>
                  <span style={{ color: "#7916F3" }}>constructor</span>
                  <span style={{ color: "#6b7280" }}>()</span>
                  <span style={{ color: "#6b7280", marginLeft: "4px" }}>
                    &#123;
                  </span>
                </div>
                <div
                  style={{
                    color: "#6b7280",
                    paddingLeft: "40px",
                    display: "flex",
                  }}
                >
                  name = &quot;PolkaSwap&quot;;
                </div>
                <div
                  style={{
                    color: "#6b7280",
                    paddingLeft: "20px",
                    display: "flex",
                  }}
                >
                  &#125;
                </div>
                <div style={{ color: "#6b7280", display: "flex" }}>
                  &#125;
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
