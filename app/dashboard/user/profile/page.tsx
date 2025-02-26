import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat
      breadCrumbs={[
        { url: "/dashboard/user", name: "user" },
        { name: "profile" },
      ]}
    >
      <Heading1 id="profile">Profile</Heading1>
    </PageFormat>
  );
}
