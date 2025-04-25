import { IoMdColorFill } from "react-icons/io";

interface IBackgroundButtonProps {
  frameColor: string;
  setFrameColor: (e: string) => void;
}

function BackgroundButton({
  frameColor,
  setFrameColor,
}: IBackgroundButtonProps) {
  return (
    <button>
      <label
        htmlFor="background"
        className="text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
        border-2 rounded-full border-gray-400 bg-white cursor-pointer block"
      >
        <IoMdColorFill />
      </label>
      <input
        type="color"
        id="background"
        value={frameColor}
        onChange={(e) => setFrameColor(e.target.value)}
        accept="image/*"
        className="h-0 w-0 absolute"
      />
    </button>
  );
}

export default BackgroundButton;
