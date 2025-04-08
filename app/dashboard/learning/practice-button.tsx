import React from "react";
import Image from "next/image";
import { outfit } from "@/app/fonts";
import Link from "next/link";

const PracticeButton = React.memo(function PracticeButton() {
  return (
    <Link href="/dashboard/eval-settings">
      <div className="flex items-center gap-2 group w-full h-[120px] rounded-lg bg-lightLatte hover:bg-lightLatte/50 dark:bg-darkCoffee dark:hover:bg-darkCoffee/50 relative overflow-hidden duration-200">
        <div className="h-full flex items-center pl-4">
          <span
            className="text-white dark:text-darkBurnt text-5xl font-bold uppercase absolute z-20 group-hover:-translate-x-52 duration-500"
            style={outfit.style}
          >
            Practice Presenting
          </span>
        </div>
        <div className="w-full h-full flex justify-between gap-4 items-end absolute">
          <Image
            src={"/coffee_bean.svg"}
            alt={""}
            width={50}
            height={50}
            className="translate-y-20 duration-500 group-hover:rotate-12 group-hover:-translate-y-10"
          ></Image>
          <Image
            src={"/coffee_bean.svg"}
            alt={""}
            width={50}
            height={50}
            className="translate-y-20 duration-700 group-hover:-rotate-12 group-hover:-translate-y-8"
          ></Image>
          <Image
            src={"/coffee_bean.svg"}
            alt={""}
            width={50}
            height={50}
            className="translate-y-20 duration-500 group-hover:rotate-12 group-hover:-translate-y-8"
          ></Image>
          <Image
            src={"/coffee_bean.svg"}
            alt={""}
            width={50}
            height={50}
            className="translate-y-20 duration-700 group-hover:-rotate-12 group-hover:-translate-y-8"
          ></Image>
          <Image
            src={"/coffee_bean.svg"}
            alt={""}
            width={50}
            height={50}
            className="translate-y-20 duration-500 group-hover:rotate-12 group-hover:-translate-y-10"
          ></Image>
        </div>
        <div className="w-full h-full flex items-center justify-end pr-4">
          <span
            className="text-lightCoffee/50 dark:text-lightLatte/50 text-9xl font-black absolute group-hover:translate-x-8 duration-500 z-0"
            style={outfit.style}
          >
            {">>>"}
          </span>
        </div>
      </div>
    </Link>
  );
});

export default PracticeButton;
