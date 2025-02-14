"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat breadCrumbs={[]}>
      <Heading1 id="dashboard">Dashboard</Heading1>
    </PageFormat>
  );
}
