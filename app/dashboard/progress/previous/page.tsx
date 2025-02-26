import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat
      breadCrumbs={[
        { url: "/dashboard/progress", name: "progress" },
        { name: "previous" },
      ]}
    >
      <Heading1 id="previous">Previous Sessions</Heading1>
    </PageFormat>
  );
}
