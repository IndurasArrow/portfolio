import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hero, site } from "@/content/site";

const fontDir = join(process.cwd(), "src/assets/fonts");
const font = (weight: 300 | 400 | 500) =>
  readFile(join(fontDir, `inter-latin-${weight}-normal.woff`));

const colors = {
  bg: "#0c0a09",
  fg: "#fafaf9",
  muted: "#a1a1aa",
  border: "#292524",
};

// A fixed scatter of dots, standing in for the site's particle field.
const dots: [number, number, number][] = [
  [120, 190, 3], [310, 130, 2], [520, 250, 4], [700, 150, 2], [860, 300, 3],
  [1010, 170, 4], [1120, 330, 2], [940, 470, 3], [1090, 540, 2], [760, 420, 2],
  [420, 360, 2], [230, 300, 3], [610, 90, 3], [1150, 120, 3], [880, 110, 2],
];

/** Shared renderer for the Open Graph and Twitter preview images. */
export async function renderSocialImage(size: { width: number; height: number }) {
  const [light, regular, medium] = await Promise.all([
    font(300),
    font(400),
    font(500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "36px 56px 52px",
          background: colors.bg,
          color: colors.fg,
          fontFamily: "Inter",
        }}
      >
        {dots.map(([x, y, r]) => (
          <div
            key={`${x}-${y}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              background: colors.fg,
              opacity: 0.45,
            }}
          />
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
            padding: "0 28px",
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            fontSize: 20,
          }}
        >
          <div style={{ display: "flex" }}>{site.name}</div>
          <div style={{ display: "flex", gap: 28, color: colors.muted }}>
            <span>Work</span>
            <span>Domains</span>
            <span>Method</span>
            <span>About</span>
            <span>Contact</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: -3.5,
            }}
          >
            {hero.headline.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              width: 300,
              marginLeft: -440,
              marginBottom: 22,
              fontSize: 19,
              lineHeight: 1.4,
              color: colors.muted,
            }}
          >
            I take AI products from handover to production.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: light, weight: 300, style: "normal" },
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}

/** The "DM" monogram, used for the favicon and the Apple touch icon. */
export async function renderMark(px: number, rounded: boolean) {
  const medium = await font(500);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: colors.bg,
          color: colors.fg,
          borderRadius: rounded ? px * 0.22 : 0,
          fontFamily: "Inter",
          fontWeight: 500,
          fontSize: px * 0.44,
          letterSpacing: px * -0.02,
        }}
      >
        DM
      </div>
    ),
    {
      width: px,
      height: px,
      fonts: [{ name: "Inter", data: medium, weight: 500, style: "normal" }],
    },
  );
}
