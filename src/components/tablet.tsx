import Image, { type StaticImageData } from "next/image";
import type { CSSProperties } from "react";

/**
 * A design study's cover on a tablet, built from plain elements in 3D. It
 * sits at an angle and turns towards the pointer: the card it is in already
 * tracks the pointer (see GlowCard), and the tablet reads the same values.
 * The covers are landscape slides, so the device is landscape too.
 */
export function Tablet({ image }: { image: StaticImageData }) {
  return (
    <div className="tablet-scene">
      <div className="tablet">
        <span className="tablet-shadow" />
        {/* Thin slices behind the face give the body its thickness. */}
        {[1, 2, 3, 4, 5].map((slice) => (
          <span
            key={slice}
            className="tablet-edge"
            style={{ "--slice": slice } as CSSProperties}
          />
        ))}
        <div className="tablet-face">
          <div className="tablet-screen">
            <Image
              src={image}
              alt=""
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 36vw, 70vw"
              className="object-cover"
            />
            <span className="tablet-sheen" />
          </div>
        </div>
      </div>
    </div>
  );
}
