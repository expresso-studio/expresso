"use client";

import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat breadCrumbs={[{ name: "user" }]}>
      <Heading1 id="user">User</Heading1>
    </PageFormat>
  );
}
