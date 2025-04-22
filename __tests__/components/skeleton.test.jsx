// Skeleton.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "@/components/ui/skeleton";

describe("Skeleton component", () => {
  it("renders without crashing", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeletonElement = screen.getByTestId("skeleton");
    expect(skeletonElement).toBeInTheDocument();
  });

  it("has default skeleton classes", () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeletonElement = screen.getByTestId("skeleton");
    expect(skeletonElement).toHaveClass("animate-pulse");
    expect(skeletonElement).toHaveClass("rounded-md");
    expect(skeletonElement).toHaveClass("bg-stone-100");
    expect(skeletonElement).toHaveClass("dark:bg-stone-800");
  });

  it("merges custom className with default classes", () => {
    render(<Skeleton data-testid="skeleton" className="custom-class" />);
    const skeletonElement = screen.getByTestId("skeleton");
    expect(skeletonElement).toHaveClass(
      "animate-pulse",
      "rounded-md",
      "bg-stone-100",
      "dark:bg-stone-800",
      "custom-class",
    );
  });

  it("accepts additional props such as style", () => {
    render(<Skeleton data-testid="skeleton" style={{ color: "red" }} />);
    const skeletonElement = screen.getByTestId("skeleton");
    expect(skeletonElement).toHaveStyle("color: red");
  });
});
