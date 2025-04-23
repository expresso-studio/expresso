// sidebar.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Simple child component to confirm context usage.
function TestSidebarState() {
  const { open } = useSidebar();
  return <span data-testid="state">{open ? "open" : "closed"}</span>;
}

describe("Sidebar & SidebarProvider", () => {
  test("renders with defaultOpen (expanded initially)", () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent data-testid="content" />
        </Sidebar>
        <TestSidebarState />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("open");
    expect(
      screen.getByTestId("content").closest("[data-state]"),
    ).toHaveAttribute("data-state", "expanded");
  });

  test("renders collapsed if defaultOpen={false}", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <SidebarContent data-testid="content" />
        </Sidebar>
        <TestSidebarState />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("closed");
    expect(
      screen.getByTestId("content").closest("[data-state]"),
    ).toHaveAttribute("data-state", "collapsed");
  });

  test("can be controlled externally via open / onOpenChange", async () => {
    const handleOpenChange = jest.fn();
    const { rerender } = render(
      <SidebarProvider open={false} onOpenChange={handleOpenChange}>
        <Sidebar>
          <SidebarContent data-testid="content" />
        </Sidebar>
        <TestSidebarState />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("closed");
    // Switch to open externally
    rerender(
      <SidebarProvider open onOpenChange={handleOpenChange}>
        <Sidebar>
          <SidebarContent data-testid="content" />
        </Sidebar>
        <TestSidebarState />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("open");
  });

  test("SidebarTrigger toggles sidebar", async () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarTrigger data-testid="trigger" />
        <Sidebar>
          <SidebarContent data-testid="content" />
        </Sidebar>
        <TestSidebarState />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("closed");
    await userEvent.click(screen.getByTestId("trigger"));
    expect(screen.getByTestId("state").textContent).toBe("open");
  });

  test("keyboard shortcut (Ctrl + b) toggles sidebar", async () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar>
          <SidebarContent data-testid="content" />
        </Sidebar>
        <TestSidebarState />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("state").textContent).toBe("closed");
    await userEvent.keyboard("{Control>}b{/Control}");
    expect(screen.getByTestId("state").textContent).toBe("open");
  });

  test('renders collapsible="none"', () => {
    render(
      <SidebarProvider>
        <Sidebar collapsible="none" data-testid="sidebar-none">
          <SidebarContent data-testid="content" />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("sidebar-none")).toBeInTheDocument();
  });
});

describe("Desktop-only subcomponents", () => {
  test("SidebarRail renders", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarRail data-testid="rail" />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("rail")).toBeInTheDocument();
  });

  test("SidebarInset renders", () => {
    render(
      <SidebarProvider>
        <SidebarInset data-testid="inset" />
      </SidebarProvider>,
    );
    expect(screen.getByTestId("inset")).toBeInTheDocument();
  });

  test("SidebarHeader renders", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader data-testid="header" />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  test("SidebarFooter renders", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarFooter data-testid="footer" />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  test("SidebarSeparator renders", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarSeparator data-testid="sep" />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("sep")).toBeInTheDocument();
  });
});

describe("SidebarGroup family", () => {
  test("renders group, label, content, action", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarGroup data-testid="group">
            <SidebarGroupLabel data-testid="group-label">
              Group Label
            </SidebarGroupLabel>
            <SidebarGroupContent data-testid="group-content">
              Group Content
            </SidebarGroupContent>
            <SidebarGroupAction data-testid="group-action">
              Group Action
            </SidebarGroupAction>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("group")).toBeInTheDocument();
    expect(screen.getByTestId("group-label")).toHaveTextContent("Group Label");
    expect(screen.getByTestId("group-content")).toHaveTextContent(
      "Group Content",
    );
    expect(screen.getByTestId("group-action")).toHaveTextContent(
      "Group Action",
    );
  });
});

describe("SidebarInput", () => {
  test("renders with placeholder", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarInput data-testid="input" placeholder="Search..." />
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId("input")).toHaveAttribute(
      "placeholder",
      "Search...",
    );
  });
});

describe("SidebarMenu family", () => {
  test("renders menu, item, button, action, badge, skeleton, sub, subItem, subButton", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu data-testid="menu">
            <SidebarMenuItem data-testid="item">
              <SidebarMenuButton
                data-testid="button"
                tooltip="Tooltip"
                isActive
              >
                Menu Button
              </SidebarMenuButton>
              <SidebarMenuAction data-testid="action">Action</SidebarMenuAction>
              <SidebarMenuBadge data-testid="badge">Badge</SidebarMenuBadge>
              <SidebarMenuSkeleton data-testid="skeleton" showIcon />
              <SidebarMenuSub data-testid="sub">
                <SidebarMenuSubItem data-testid="subitem">
                  <SidebarMenuSubButton data-testid="subbutton">
                    Sub Button
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>,
    );

    // Check existence
    expect(screen.getByTestId("menu")).toBeInTheDocument();
    expect(screen.getByTestId("item")).toBeInTheDocument();
    expect(screen.getByTestId("button")).toHaveTextContent("Menu Button");
    expect(screen.getByTestId("action")).toHaveTextContent("Action");
    expect(screen.getByTestId("badge")).toHaveTextContent("Badge");
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("sub")).toBeInTheDocument();
    expect(screen.getByTestId("subitem")).toBeInTheDocument();
    expect(screen.getByTestId("subbutton")).toHaveTextContent("Sub Button");
  });
});

describe("SidebarMenuButton without tooltip", () => {
  test("renders plain button when tooltip is not provided", () => {
    render(
      <SidebarProvider>
        <SidebarMenuButton data-testid="menu-button">
          Menu Button
        </SidebarMenuButton>
      </SidebarProvider>,
    );
    const button = screen.getByTestId("menu-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Menu Button");
    const tooltipEl = screen.queryByText("Tooltip");
    expect(tooltipEl).toBeNull();
  });
});

describe("useSidebar", () => {
  it("throws an error when used outside a SidebarProvider", () => {
    const consoleSpy = jest.spyOn(console, "error");
    consoleSpy.mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSidebar());
    }).toThrow("useSidebar must be used within a SidebarProvider.");

    consoleSpy.mockRestore();
  });
});

describe("SidebarMenuAction (showOnHover prop)", () => {
  test("applies hover classes when showOnHover is true", () => {
    render(<SidebarMenuAction showOnHover data-testid="menu-action-test" />);
    const menuActionEl = screen.getByTestId("menu-action-test");

    // Assert that the className includes the CSS tokens covering the showOnHover branch.
    expect(menuActionEl.className).toMatch(
      /group-focus-within\/menu-item:opacity-100/,
    );
    expect(menuActionEl.className).toMatch(
      /group-hover\/menu-item:opacity-100/,
    );
    expect(menuActionEl.className).toMatch(/data-\[state=open\]:opacity-100/);
    expect(menuActionEl.className).toMatch(
      /peer-data-\[active=true\]\/menu-button:text-sidebar-accent-foreground/,
    );
    expect(menuActionEl.className).toMatch(/md:opacity-0/);
  });
});

describe("Sidebar with right side and floating variant", () => {
  test("applies right side and floating/inset specific classes", () => {
    // Render a Sidebar with side="right" and variant="floating"
    const { container } = render(
      <SidebarProvider>
        <Sidebar side="right" variant="floating" data-testid="sidebar-test">
          <SidebarContent>Test Content</SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    // The second nested div in Sidebar (the fixed element) should have the conditional classes applied.
    const fixedDiv = container.querySelector("div.duration-200.fixed");
    expect(fixedDiv).toBeInTheDocument();

    // Check for the right alignment classes.
    expect(fixedDiv.className).toMatch(
      /right-0 group-data-\[collapsible=offcanvas\]:right-\[calc\(var\(--sidebar-width\)\*-1\)\]/,
    );
    // Check for the padding and width adjustment for floating/inset variants.
    expect(fixedDiv.className).toMatch(
      /p-2 group-data-\[collapsible=icon\]:w-\[calc\(var\(--sidebar-width-icon\)_\+_theme\(spacing\.4\)_\+2px\)\]/,
    );
  });
});

describe("Controlled Sidebar (setOpenProp callback)", () => {
  test("SidebarTrigger calls onOpenChange with the correct value when toggled", async () => {
    const onOpenChange = jest.fn();
    render(
      <SidebarProvider open={false} onOpenChange={onOpenChange}>
        <SidebarTrigger data-testid="trigger" />
      </SidebarProvider>,
    );

    // Initially, the sidebar is closed.
    await userEvent.click(screen.getByTestId("trigger"));
    // The onOpenChange callback should be called with true to open the sidebar.
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("Controlled Sidebar setOpen with function callback", () => {
  test("calls onOpenChange with computed value when setOpen receives a function", () => {
    const onOpenChange = jest.fn();
    const initialOpen = false;

    // Create a wrapper using SidebarProvider with controlled props.
    const wrapper = ({ children }) => (
      <SidebarProvider open={initialOpen} onOpenChange={onOpenChange}>
        {children}
      </SidebarProvider>
    );

    // Render the hook within the provider.
    const { result } = renderHook(() => useSidebar(), { wrapper });

    // Use act() to update state.
    act(() => {
      // This callback should compute the new state as !initialOpen, i.e. true.
      result.current.setOpen((prev) => !prev);
    });

    // Assert that the onOpenChange callback was invoked with the computed open state.
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("SidebarMenuSubButton", () => {
  test("renders as an anchor with correct attributes and conditional classes", () => {
    // Render the component with size="sm" and isActive true.
    render(
      <SidebarMenuSubButton data-testid="sub-button" size="sm" isActive={true}>
        Sub Button Content
      </SidebarMenuSubButton>,
    );

    // The component should render as an "a" element because 'asChild' is false by default.
    const subButton = screen.getByTestId("sub-button");
    expect(subButton.tagName).toBe("A");

    // Assert the presence of the expected data attributes.
    expect(subButton).toHaveAttribute("data-sidebar", "menu-sub-button");
    expect(subButton).toHaveAttribute("data-size", "sm");
    expect(subButton).toHaveAttribute("data-active", "true");

    // Verify that the content is rendered.
    expect(subButton).toHaveTextContent("Sub Button Content");

    // The conditional class for small size ("text-xs") should be present.
    expect(subButton.className).toMatch(/text-xs/);

    // Additionally verify some baseline classes are present (e.g., "flex" to confirm our className concatenation).
    expect(subButton.className).toMatch(/flex/);

    // Optionally, verify active state classes as implemented (for example, checking a substring from 'data-[active=true]')
    expect(subButton.className).toMatch(
      /data-\[active=true\]:bg-sidebar-accent/,
    );
  });
});

describe("SidebarMenuSubButton - asChild prop", () => {
  test("renders as an anchor element when asChild is false (default)", () => {
    render(
      <SidebarMenuSubButton data-testid="sub-button">
        Default Button
      </SidebarMenuSubButton>,
    );
    const subButton = screen.getByTestId("sub-button");
    // Should render as an "a" element.
    expect(subButton.tagName).toBe("A");
  });

  test("renders as a custom component when asChild is true", () => {
    const DummyComponent = React.forwardRef((props, ref) => (
      <span ref={ref} data-testid="dummy">
        {props.children}
      </span>
    ));

    render(
      <SidebarMenuSubButton asChild data-testid="sub-button">
        <DummyComponent>Custom Button</DummyComponent>
      </SidebarMenuSubButton>,
    );

    // Since asChild is true, the test id should resolve to the DummyComponent's element.
    const dummyElement = screen.getByTestId("dummy");
    expect(dummyElement.tagName).toBe("SPAN");
    expect(dummyElement).toHaveTextContent("Custom Button");
  });
});

describe("SidebarMenuAction - asChild prop", () => {
  test("renders as a button element when asChild is false (default)", () => {
    render(
      <SidebarMenuAction data-testid="action-button">Action</SidebarMenuAction>,
    );
    const actionButton = screen.getByTestId("action-button");
    // When asChild is false, it should render as a <button>
    expect(actionButton.tagName).toBe("BUTTON");
    expect(actionButton).toHaveTextContent("Action");
  });

  test("renders as a custom element when asChild is true", () => {
    // Create a dummy component to be used as a custom child.
    const DummyComponent = React.forwardRef((props, ref) => (
      <span ref={ref} data-testid="dummy">
        {props.children}
      </span>
    ));

    render(
      <SidebarMenuAction asChild data-testid="action-button">
        <DummyComponent>Custom Action</DummyComponent>
      </SidebarMenuAction>,
    );

    // Since asChild is true, the rendered element should be the DummyComponent.
    const dummyElement = screen.getByTestId("dummy");
    expect(dummyElement.tagName).toBe("SPAN");
    expect(dummyElement).toHaveTextContent("Custom Action");
  });
});
