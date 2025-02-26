import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat
      breadCrumbs={[
        { url: "/dashboard/progress", name: "progress" },
        { name: "statistics" },
      ]}
    >
      <Heading1 id="account">Statistics</Heading1>
    </PageFormat>
  );
}
