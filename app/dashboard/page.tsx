"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import Section from "@/components/section";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <PageFormat breadCrumbs={[]}>
      <Heading1 id="greeting">
        Hi <span className="text-lightCoffee">Joanne</span>!
      </Heading1>
      <div className="mt-4 flex flex-row gap-16">
        <div className="flex flex-col gap-16 w-full">
          <Section
            id="evaluate"
            title="Jump on in!"
            className="bg-lightCoffee dark:bg-darkCoffee group cursor-pointer"
          >
            <Link href={"/dashboard/evaluate"}>
              <div className="absolute z-20 flex flex-col gap-2">
                <span className="text-8xl font-black text-white uppercase group-hover:translate-x-1 duration-200">
                  Evaluate
                </span>
                <span className="text-4xl italic text-white group-hover:translate-x-2 duration-500">
                  a new presentation
                </span>
              </div>
              <div className="pt-28 overflow-hidden flex flex-col items-end">
                <Image
                  src={"./teapot.svg"}
                  alt={"a teapot"}
                  width="500"
                  height="500"
                  className="w-[60%] max-w-[450px] absolute translate-x-12 translate-y-10 scale-x-[-1] z-10 group-hover:rotate-6 group-hover:scale-y-[1.05] ease-out duration-200"
                />
                <div className="flex flex-row justify-end ">
                  <div className="bg-[#ac795d] dark:bg-[#9c6446] w-[35vw] h-[300px] z-0 rounded-lg group-hover:scale-105 duration-500"></div>
                </div>
              </div>
            </Link>
          </Section>
          <Section id="learning" title="Learning">
            <>aasdf</>
          </Section>
        </div>
        <div className="flex flex-col gap-16 w-full">
          <Section id="previous" title="Previous presentations">
            <>aasdf</>
          </Section>
          <Section id="progress" title="Progress" className="bg-transparent">
            <>aasdf</>
          </Section>
        </div>
      </div>
    </PageFormat>
  );
}
