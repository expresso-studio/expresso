"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat breadCrumbs={[{ name: "learning" }]}>
      <Heading1 id="learning">Learning</Heading1>
    </PageFormat>
  );
}
