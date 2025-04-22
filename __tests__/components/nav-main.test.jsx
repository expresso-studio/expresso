import { render, screen } from "@testing-library/react";
import { NavMain } from "@/components/nav-main";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("NavMain Component", () => {
  it("renders without crashing", () => {
    console.log("Available matchers:", expect.toBeInTheDocument);
    render(
      <SidebarProvider>
        <NavMain />
      </SidebarProvider>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
  it('computes active path as "dashboard" when pathname has less than 3 segments', () => {
    // When pathname is "/" the computed path is "dashboard".
    usePathname.mockReturnValue("/");
    render(
      <SidebarProvider>
        <NavMain />
      </SidebarProvider>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it('computes active path correctly as "progress" when pathname has 3 or more segments', () => {
    // When pathname is "/dashboard/progress", the computed path is "progress".
    usePathname.mockReturnValue("/dashboard/progress");
    render(
      <SidebarProvider>
        <NavMain />
      </SidebarProvider>,
    );

    const progressLink = screen.queryByRole("link", { name: /Progress/i });
    expect(progressLink).toBeNull();

    expect(screen.getByText("Progress")).toBeInTheDocument();
  });
});
