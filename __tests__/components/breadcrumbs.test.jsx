// breadcrumbs.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"; // Adjust the import path as needed

describe("Breadcrumb Components", () => {
  test("Breadcrumb renders a nav with aria-label 'breadcrumb'", () => {
    render(<Breadcrumb data-testid="breadcrumb">Test Breadcrumb</Breadcrumb>);
    const navEl = screen.getByTestId("breadcrumb");
    expect(navEl.tagName).toBe("NAV");
    expect(navEl).toHaveAttribute("aria-label", "breadcrumb");
    expect(navEl).toHaveTextContent("Test Breadcrumb");
  });

  test("BreadcrumbList renders an ordered list with appropriate classes", () => {
    render(
      <BreadcrumbList data-testid="breadcrumb-list">
        <li>Item 1</li>
      </BreadcrumbList>
    );
    const olEl = screen.getByTestId("breadcrumb-list");
    expect(olEl.tagName).toBe("OL");
    expect(olEl.className).toMatch(/flex/);
    expect(olEl).toHaveTextContent("Item 1");
  });

  test("BreadcrumbItem renders a list item with appropriate classes", () => {
    render(
      <ul>
        <BreadcrumbItem data-testid="breadcrumb-item">Item</BreadcrumbItem>
      </ul>
    );
    const liEl = screen.getByTestId("breadcrumb-item");
    expect(liEl.tagName).toBe("LI");
    expect(liEl.className).toMatch(/inline-flex/);
    expect(liEl).toHaveTextContent("Item");
  });

  test("BreadcrumbLink renders as an anchor by default", () => {
    render(
      <BreadcrumbLink data-testid="breadcrumb-link" href="/test">
        Test Link
      </BreadcrumbLink>
    );
    const linkEl = screen.getByTestId("breadcrumb-link");
    expect(linkEl.tagName).toBe("A");
    expect(linkEl).toHaveAttribute("href", "/test");
    expect(linkEl).toHaveTextContent("Test Link");
  });
  
  test("BreadcrumbLink renders as a child when asChild is true", () => {
    render(
      <BreadcrumbLink asChild data-testid="breadcrumb-link-child" href="/child">
        <span data-testid="child-span">Child Link</span>
      </BreadcrumbLink>
    );
    const childSpan = screen.getByTestId("child-span");
    expect(childSpan.tagName).toBe("SPAN");
    expect(childSpan).toHaveTextContent("Child Link");
  });

  test("BreadcrumbPage renders a span with proper accessibility attributes", () => {
    render(
      <BreadcrumbPage data-testid="breadcrumb-page">Current Page</BreadcrumbPage>
    );
    const pageEl = screen.getByTestId("breadcrumb-page");
    expect(pageEl.tagName).toBe("SPAN");
    expect(pageEl).toHaveAttribute("role", "link");
    expect(pageEl).toHaveAttribute("aria-disabled", "true");
    expect(pageEl).toHaveAttribute("aria-current", "page");
    expect(pageEl).toHaveTextContent("Current Page");
  });

  test("BreadcrumbSeparator renders a list item with default ChevronRight", () => {
    render(<BreadcrumbSeparator data-testid="breadcrumb-separator" />);
    const sepEl = screen.getByTestId("breadcrumb-separator");
    expect(sepEl.tagName).toBe("LI");
    // Check that a child SVG element is rendered, assuming ChevronRight is an SVG.
    const svg = sepEl.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  test("BreadcrumbEllipsis renders a span with MoreHorizontal icon and hidden 'More' text", () => {
    render(<BreadcrumbEllipsis data-testid="breadcrumb-ellipsis" />);
    const ellipsisEl = screen.getByTestId("breadcrumb-ellipsis");
    expect(ellipsisEl.tagName).toBe("SPAN");
    const svg = ellipsisEl.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const srText = ellipsisEl.querySelector(".sr-only");
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveTextContent("More");
  });
});
