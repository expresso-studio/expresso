// page-format.test.jsx
import React from "react";
import { render } from "@testing-library/react";
import PageFormat from "@/components/page-format"; 
import { SidebarProvider } from "@/components/ui/sidebar"


describe("PageFormat - Breadcrumb container", () => {
  test("renders a container div with class 'flex items-center gap-4' for each breadcrumb with a URL", () => {
    const breadCrumbs = [
      { url: "/home", name: "Home" },
      { url: "/dashboard", name: "Dashboard" },
      { name: "Current Page" },
    ];

    // Render the PageFormat component with sample breadcrumbs.
    const { container } = render(
        <SidebarProvider>
            <PageFormat breadCrumbs={breadCrumbs}>
                <p>Page Content</p>
            </PageFormat>
        </SidebarProvider>
    );

    // Query for all divs that have the class combination "flex items-center gap-4".
    const containerDivs = container.querySelectorAll("div.flex.items-center.gap-4");

    // Since we have two breadcrumb items with a URL, expect two container divs.
    expect(containerDivs.length).toBe(2);
    
    // Verify that the first container div contains the "Home" breadcrumb.
    expect(containerDivs[0].textContent).toContain("Home");
    // Verify that the second container div contains the "Dashboard" breadcrumb.
    expect(containerDivs[1].textContent).toContain("Dashboard");
  });
});
