import React, { useState } from "react";

/**
 * Avatar
 * Renders a circular profile photo. Falls back to the person's initials
 * on a neutral background if no image is provided or the image fails to load.
 *
 * Kept as its own module so it can be reused anywhere a person needs
 * a photo/initials treatment (lists, headers, cards, etc.).
 */
function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Avatar({ src, name, size = 64 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = src && !imgFailed;

  const dimensionStyle = { width: size, height: size };

  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-slate-200 text-slate-600 font-semibold select-none"
      style={dimensionStyle}
      role="img"
      aria-label={name ? `${name}'s avatar` : "Avatar"}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ? `${name}'s avatar` : "Avatar"}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span style={{ fontSize: size * 0.36 }}>{getInitials(name) || "?"}</span>
      )}
    </div>
  );
}
