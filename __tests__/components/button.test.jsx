import React from "react";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button component", () => {
  test("renders a native button when asChild is false", () => {
    render(<Button>Click me</Button>);
    // Check if the element has the role 'button'
    const buttonElement = screen.getByRole("button");
    expect(buttonElement.tagName.toLowerCase()).toBe("button");
  });

  test("renders custom element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    // Find the anchor element by its text content
    const linkElement = screen.getByText("Link Button");
    // When asChild is true, the child component should be rendered directly
    expect(linkElement.tagName.toLowerCase()).toBe("a");
  });
});
