import { renderMark } from "@/lib/og";

export const size = { width: 96, height: 96 };
export const contentType = "image/png";

export default function Icon() {
  return renderMark(size.width, true);
}
