import Section from "@/components/section";
import { WPMChart } from "../progress/wpm-chart";
import Summary from "../progress/summary";
import TopFiller from "../progress/top-filler";

export default function ProgressSection() {
  return (
    <Section
      id="progress"
      title="Progress"
      className="bg-transparent dark:bg-transparent p-0 flex flex-col gap-8"
    >
      <WPMChart />
      <WPMChart />
      <div className="flex flex-col sm:flex-row gap-8">
        <Summary short={true} />
        <TopFiller short={false} />
      </div>
    </Section>
  );
}
