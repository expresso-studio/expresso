"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";
import PreviousPresentationsSection from "../(home)/previous-presentations";
import { WPMChart } from "./wpm-chart";
import Summary from "./summary";
import Section from "@/components/section";
import TopFiller from "./top-filler";

/**
 * Page component that renders the progress page.
 * @returns {JSX.Element} The JSX element representing the progress page.
 */
export default function Page() {
  return (
    <PageFormat breadCrumbs={[{ name: "progress" }]}>
      <Heading1 id="user">Progress</Heading1>
      <div className="flex gap-8">
        <div className="flex flex-col gap-8">
          <PreviousPresentationsSection />
          <Section
            id="progress"
            title="Progress"
            link={"/dashboard/progress"}
            className="flex w-full gap-8"
          >
            <div className="w-full">
              <WPMChart />
            </div>
            <div>
              <TopFiller short={false} />
            </div>
          </Section>
        </div>
        <Summary short={false} />
      </div>
    </PageFormat>
  );
}
