import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat
      breadCrumbs={[
        { url: "/dashboard/progress", name: "progress" },
        { name: "suggestions" },
      ]}
    >
      <Heading1 id="suggestions">Learning suggestions</Heading1>
    </PageFormat>
  );
}
