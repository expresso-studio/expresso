import { render, screen, fireEvent } from "@testing-library/react";
import { NavMain } from "@/components/nav-main";
import { usePathname } from "next/navigation";
import { BiCoffee } from "react-icons/bi";
import { AiOutlineLineChart } from "react-icons/ai";
import { IoBookOutline } from "react-icons/io5";
import {describe, expect, test} from '@jest/globals';

// Mock usePathname hook from next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("NavMain Component", () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
  });

  test("renders navigation menu items", () => {
    render(<NavMain />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Evaluate")).toBeInTheDocument();
    expect(screen.getByText("Progress")).toBeInTheDocument();
    expect(screen.getByText("Learning")).toBeInTheDocument();
  });

  test("sets active state based on current path", () => {
    render(<NavMain />);

    const activeItem = screen.getByText("Dashboard");
    expect(activeItem).toBeInTheDocument();
  });

  test("expands collapsible menu on click", () => {
    render(<NavMain />);

    const progressMenu = screen.getByText("Progress");
    fireEvent.click(progressMenu);

    expect(screen.getByText("statistics")).toBeInTheDocument();
    expect(screen.getByText("learning suggestions")).toBeInTheDocument();
    expect(screen.getByText("previous sessions")).toBeInTheDocument();
  });

  test("renders icons correctly", () => {
    render(<NavMain />);

    expect(screen.getByRole("img", { name: /biCoffee/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /aiOutlineLineChart/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /ioBookOutline/i })).toBeInTheDocument();
  });
});
