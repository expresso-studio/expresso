import React from "react";
import { outfit } from "@/app/fonts";

interface Props {
  id: string;
  children: React.ReactNode;
}

const Heading1 = React.memo<Props>(function Heading1({ id, children }) {
  return (
    <h1 id={id} className="text-2xl sm:text-4xl font-bold" style={outfit.style}>
      {children}
    </h1>
  );
});

export default Heading1;
