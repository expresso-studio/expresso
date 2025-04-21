import * as React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Input } from "@/components/ui/input"

describe("Input Component", () => {
    it("renders without crashing", () => {
        render(<Input />)
        expect(screen.getByRole("textbox")).toBeInTheDocument()
    })

    it("applies className prop", () => {
        render(<Input className="custom-class" />)
        const input = screen.getByRole("textbox")
        expect(input).toHaveClass("custom-class")
    })

    it("renders with placeholder", () => {
        render(<Input placeholder="Enter your name" />)
        expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument()
    })

    it("renders with type 'password'", () => {
        render(<Input type="password" placeholder="Enter password" />)
        const input = screen.getByPlaceholderText("Enter password")
        expect(input).toHaveAttribute("type", "password")
    })

    it("is disabled when disabled prop is passed", () => {
        render(<Input disabled />)
        const input = screen.getByRole("textbox")
        expect(input).toBeDisabled()
    })

    it("handles user typing", async () => {
        render(<Input />)
        const input = screen.getByRole("textbox")
        await userEvent.type(input, "Hello")
        expect(input).toHaveValue("Hello")
    })

    it("forwards ref correctly", () => {
        const ref = React.createRef() 
        render(<Input ref={ref} />)
        expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })
  
})
