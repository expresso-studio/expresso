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
          <div className = "p-6 rounded-lg flex flex-col items-center">
            <p className = "text-4xl mb-4">
              Welcome to <span className="font-bold">Expresso</span>!
            </p>
            <h1 className ="mb-2">Brewing confidence, one gesture at a time.</h1>
            <div className="mt-8">
              <LoginButton/>
            </div>
          </div>
        </div>
      </main>
      <FooterWave />
    </div>
  );
}
