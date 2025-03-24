import Image from "next/image";

const FooterWave = () => {
  return (
    <footer className="relative w-full">
      <Image
        src="/footer-wave-1.svg"
        alt="Wave Design in Footer"
        width={800}
        height={100}
        className="absolute bottom-0 left-0 w-full"
      />
    </footer>
  );
};

export default FooterWave;
