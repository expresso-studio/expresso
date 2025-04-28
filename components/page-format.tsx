"use client";

import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

type BreadcrumbItem = { url?: string; name: string };

interface Props {
  children: React.ReactNode;
  breadCrumbs: BreadcrumbItem[];
}

const PageFormat = React.memo<Props>(function Heading1({
  children,
  breadCrumbs,
}) {
  return (
    <>
      <header className="flex h-24 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-18">
        <div className="flex items-center gap-2 p-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadCrumbs.map((breadCrumb, i) =>
                breadCrumb.url ? (
                  <div className="flex items-center gap-4" key={i}>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href={breadCrumb.url}>
                        {breadCrumb.name}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </div>
                ) : (
                  <BreadcrumbPage key={i}>{breadCrumb.name}</BreadcrumbPage>
                ),
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <main className="flex flex-col gap-4 px-10 overflow-hidden">
        {children}
      </main>
    </>
  );
});

export default PageFormat;
