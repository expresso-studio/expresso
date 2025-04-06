import { render, screen } from "@testing-library/react";
import { NavMain } from "@/components/nav-main";
import { SidebarProvider } from "@/components/ui/sidebar"

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("NavMain Component", () => {
  it("renders without crashing", () => {
    console.log("Available matchers:", expect.toBeInTheDocument);
    render(
      <SidebarProvider>
        <NavMain />
      </SidebarProvider>
    );
    
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
})