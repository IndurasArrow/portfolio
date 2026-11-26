import { renderSocialImage } from "@/lib/og";

export const alt =
  "Divyansh Maewal, Forward Deployed Engineer: I take AI products from handover to production.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderSocialImage(size);
}
