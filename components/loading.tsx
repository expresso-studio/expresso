import React from "react";
import Image from "next/image";

/**
 * Renders a loading animation.
 * @returns The rendered loading animation.
 */
const Loading = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Image
        src={"/loading.gif"}
        alt={""}
        width={350}
        height={350}
        unoptimized
      />
    </div>
  );
};

export default Loading;
