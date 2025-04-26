import React, { ReactElement } from "react";

interface ICircleMenuProps {
  radius: number;
  size: number;
  className: string;
  children: ReactElement | ReactElement[];
  arcSpan?: number;
}

function CircleMenu({
  radius = 300,
  size = 0,
  className = "",
  children,
  arcSpan = 70,
}: ICircleMenuProps) {
  console.log(size);

  const items = React.Children.toArray(children);
  const mid = Math.ceil(items.length / 2);
  const rightItems = items.slice(0, mid);
  const leftItems = items.slice(mid);

  return (
    <div
      className={`relative ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: size,
        width: size,
      }}
    >
      {rightItems.map((child, i) => {
        const count = rightItems.length;
        const startAngle = 90 - arcSpan / 2;
        const angle = count > 1 ? startAngle + (arcSpan / (count - 1)) * i : 90;
        const transform =
          `translate(-50%, -50%) ` +
          `rotate(${angle}deg) ` +
          `translate(0, -${radius}px) ` +
          `rotate(${-angle}deg)`;
        return (
          <div
            key={`r${i}`}
            className="absolute  z-50"
            style={{ top: "50%", left: "50%", transform }}
          >
            {child}
          </div>
        );
      })}

      {leftItems.map((child, i) => {
        const count = leftItems.length;
        const startAngle = 270 - arcSpan / 2;
        const angle =
          count > 1 ? startAngle + (arcSpan / (count - 1)) * i : 270;
        const transform =
          `translate(-50%, -50%) ` +
          `rotate(${angle}deg) ` +
          `translate(0, -${radius}px) ` +
          `rotate(${-angle}deg)`;
        return (
          <div
            key={`l${i}`}
            className="absolute z-50"
            style={{ top: "50%", left: "50%", transform }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}

export default CircleMenu;
