import * as React from "react";
import Heading1 from "@/components/heading-1";
import PageFormat from "@/components/page-format";

export default function Page() {
  return (
    <PageFormat
      breadCrumbs={[
        { url: "/dashboard/user", name: "user" },
        { name: "account" },
      ]}
    >
      <Heading1 id="account">Account</Heading1>
    </PageFormat>
  );
}
