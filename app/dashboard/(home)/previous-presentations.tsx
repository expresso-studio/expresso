import Recording from "@/components/recording";
import Section from "@/components/section";
import Link from "next/link";

export default function PreviousPresentationsSection() {
  return (
    <Section id="previous" title="Previous presentations" className="pr-0">
      <div className="flex justify-end">
        <div className="overflow-x-scroll">
          <div className="flex items-center gap-4">
          <Link href={"/report"} className=" overflow-hidden">
            <Recording
              id={""}
              title={"PUSH ME"}
              thumbnail={"/example-thumbnail.png"}
              date={new Date()}
              overallScore={0}
            />
            </Link>
            <Recording
              id={""}
              title={"CSCE 482 Demo"}
              thumbnail={"/example-thumbnail.png"}
              date={new Date()}
              overallScore={0}
            />
            <Recording
              id={""}
              title={"CSCE 482 Demo"}
              thumbnail={"/example-thumbnail.png"}
              date={new Date()}
              overallScore={0}
            />
            <div
              aria-hidden={true}
              className="max-w-[1rem] text-lightGray dark:text-darkGray"
            >
              x
            </div>
          </div>
        </div>
        <div className="absolute w-[1rem] h-full bg-gradient-to-r from-transparent to-lightGray dark:to-darkGray"></div>
      </div>
    </Section>
  );
}
