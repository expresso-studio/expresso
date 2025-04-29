import Image from "next/image";
/**
 * Renders a footer with a wave design.
 * @returns The rendered footer component.
 */
const FooterWave = () => {
  return (
    <footer className="relative w-full aspect-[1280/140]">
      <Image
        src="/footer-wave-1.svg"
        alt="Wave Design in Footer"
        fill
        className="object-cover w-full"
      />
    </footer>
  );
};

export default FooterWave;
