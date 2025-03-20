import LoginButtonUI from "@/components/ui/loginbutton-ui";
import LoginButton from "../components/login-button";
import FooterWave from "@/components/ui/footer-wave";
import Image from "next/image";

export default function Page() {
  return (
    <div className = "flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center -mt-32">
        <div className = "flex items-center grid grid-cols-2 gap-8 max-w-4xl">
          <div className = "p-6 rounded-lg">
            <Image
              src={"/expresso.png"}
              alt={"Teapot Logo"}
              width="300"
              height="300" 
            />
          </div>
          <div className = "p-6 rounded-lg flex flex-col items-center space-y-4">
            <p className = "text-4xl">
              Welcome to <span className="font-bold">Expresso</span>!
            </p>
            <h1>[insert slogan]</h1>
            <LoginButton />
          </div>
        </div>
      </main>
      <FooterWave />
    </div>
  );
}
