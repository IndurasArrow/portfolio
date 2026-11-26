import { renderMark } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // iOS applies its own corner mask, so the touch icon is a full square.
  return renderMark(size.width, false);
}
