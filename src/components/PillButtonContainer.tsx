import clsx from "clsx";
import { Children } from "react";
import type { ReactNode, CSSProperties } from "react";

export type Corner = "top-right" | "top-left" | "bottom-right" | "bottom-left";

interface PillButtonContainerProps {
  children: ReactNode;
  corner?: Corner;
  className?: string;
  style?: CSSProperties;
}

export const PillButtonContainer = ({
  children,
  corner = "top-right",
  className,
  style,
}: PillButtonContainerProps) => {
  const step = 35 + 8;

  const toOffset = (row: number, col: number): CSSProperties => {
    const y = row * step;
    const x = col * step;

    switch (corner) {
      case "top-left":
        return { top: y, left: x };
      case "bottom-right":
        return { bottom: y, right: x };
      case "bottom-left":
        return { bottom: y, left: x };
      case "top-right":
      default:
        return { top: y, right: x };
    }
  };

  const wrapped = Children.toArray(children).map((child, i) => {
    const [row, col] = [0, i];
    return (
      <div key={i} style={{ position: "absolute", ...toOffset(row, col) }}>
        {child}
      </div>
    );
  });

  const cornerPos = {
    "top-right": "top-0 right-0 -translate-x-10 -translate-y-5",
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "bottom-right": "bottom-0 right-0 translate-x-1/2  translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2  translate-y-1/2",
  }[corner];

  return (
    <div className={clsx("absolute", cornerPos, className)} style={style}>
      {wrapped}
    </div>
  );
};
