"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat breadCrumbs={[{ name: "progress" }]}>
      <Heading1 id="user">Progress</Heading1>
    </PageFormat>
  );
}
