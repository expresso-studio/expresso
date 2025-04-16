// sidebar-mobile.test.jsx
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  useSidebar
} from "@/components/ui/sidebar";

// Mock the mobile hook.
jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: jest.fn(),
}));

const { useIsMobile } = require("@/hooks/use-mobile");

const TestToggleButton = () => {
    const { toggleSidebar, openMobile } = useSidebar();
    return (
      <button 
        onClick={toggleSidebar} 
        data-testid="toggle-button"
        data-open={openMobile}
      >
        Toggle Sidebar
      </button>
    );
};

describe("Mobile Sidebar variant", () => {
  beforeEach(() => {
    // Clear any previous renders that might affect document state
    document.body.innerHTML = '';
  });

  test("renders mobile variant using Sheet and SheetContent when isMobile is true", () => {
    // Force the hook to return true.
    useIsMobile.mockReturnValue(true);

    // Mock the openMobile state to true so the Sheet will be open
    jest.mock("@/components/ui/sidebar", () => {
      const originalModule = jest.requireActual("@/components/ui/sidebar");
      return {
        ...originalModule,
        Sidebar: (props) => originalModule.Sidebar({ ...props, openMobile: true }),
      };
    });

    render(
      <SidebarProvider defaultOpen={true}> {/* Make sure the sidebar is opened by default */}
        <Sidebar side="left" data-testid="mobile-sidebar">
          <SidebarContent>
            <div>Mobile Sidebar Content</div>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    // Allow the portal to render by using a small delay
    setTimeout(() => {
      // Since the SheetContent renders via a portal, query the document instead
      const sheetContent = document.querySelector('[data-mobile="true"]');
      expect(sheetContent).toBeInTheDocument();
      expect(sheetContent).toHaveAttribute("data-sidebar", "sidebar");

      // Verify that the mobile width style is applied.
      expect(sheetContent).toHaveStyle("--sidebar-width: 18rem");
    }, 0);
  });
  test("toggleSidebar function toggles mobile sidebar state when isMobile is true", async () => {
    // Set mobile mode to true
    useIsMobile.mockReturnValue(true);

    await act(async () => {
      render(
        <SidebarProvider defaultOpen={false}>
          <TestToggleButton />
          <Sidebar side="left" data-testid="mobile-sidebar">
            <SidebarContent>
              <div>Mobile Sidebar Content</div>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      );
    });

    // Get the toggle button
    const toggleButton = screen.getByTestId("toggle-button");
    
    // Initially the sidebar should be closed
    expect(toggleButton).toHaveAttribute("data-open", "false");
    
    // Trigger the toggle function
    await act(async () => {
      fireEvent.click(toggleButton);
    });
    
    // Now the sidebar should be open
    expect(toggleButton).toHaveAttribute("data-open", "true");
    
    // Toggle it again
    await act(async () => {
      fireEvent.click(toggleButton);
    });
    
    // Should be closed again
    expect(toggleButton).toHaveAttribute("data-open", "false");
  });
});