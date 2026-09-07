import { motion, useReducedMotion } from "framer-motion";
import { useState, type KeyboardEvent } from "react";
import { getFlipGalleryStep, type FlipDirection } from "../lib/flipGallery";

export type ProfileGalleryImage = {
  src: string;
  alt: string;
  objectPosition: string;
};

type Face = "a" | "b";

function facing(angle: number): Face {
  return Math.abs(Math.round(angle / 180)) % 2 === 0 ? "a" : "b";
}

export function ProfileFlipGallery({ images }: { images: ProfileGalleryImage[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [angle, setAngle] = useState(0);
  const [index, setIndex] = useState(0);
  const [faces, setFaces] = useState({ a: 0, b: 0 });

  const flip = (direction: FlipDirection) => {
    if (images.length < 2) return;
    const nextIndex = (index + direction + images.length) % images.length;
    const nextAngle = angle + direction * 180;
    setFaces((current) => ({ ...current, [facing(nextAngle)]: nextIndex }));
    setIndex(nextIndex);
    setAngle(nextAngle);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const step = getFlipGalleryStep(index, images.length, event.clientX - bounds.left, bounds.width);
    flip(step.direction);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    flip(event.key === "ArrowLeft" ? -1 : 1);
  };

  if (!images.length) return null;

  const imageStyle = (imageIndex: number) => ({
    objectPosition: images[imageIndex % images.length].objectPosition,
  });

  return (
    <div className="profile-photo-gallery" aria-label={`个人照片画廊，第 ${index + 1} 张，共 ${images.length} 张`}>
      <div
        className="profile-photo-gallery-control"
        role="button"
        tabIndex={0}
        aria-label="个人照片：点击左侧查看上一张，点击右侧查看下一张"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {prefersReducedMotion ? (
          <motion.img
            key={images[index].src}
            className="profile-photo-gallery-image"
            src={images[index].src}
            alt={images[index].alt}
            draggable={false}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={imageStyle(index)}
          />
        ) : (
          <motion.div
            className="profile-photo-gallery-flipper"
            animate={{ rotateY: angle }}
            transition={{ duration: 0.68, ease: [0.65, 0, 0.35, 1] }}
          >
            <img
              className="profile-photo-gallery-image profile-photo-gallery-front"
              src={images[faces.a].src}
              alt={images[faces.a].alt}
              draggable={false}
              style={imageStyle(faces.a)}
            />
            <img
              className="profile-photo-gallery-image profile-photo-gallery-back"
              src={images[faces.b].src}
              alt={images[faces.b].alt}
              draggable={false}
              style={imageStyle(faces.b)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
