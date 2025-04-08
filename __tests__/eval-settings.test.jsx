// __tests__/Page.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "app/dashboard/eval-settings/page";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ScriptProvider } from "@/context/ScriptContext";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Page Component", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: pushMock,
    });
    pushMock.mockClear();
  });

  it("renders form elements", () => {
    render(
      <ScriptProvider>
        <SidebarProvider>
          <Page />
        </SidebarProvider>
      </ScriptProvider>
    );
    expect(screen.getByLabelText(/Presenting Topic:/i)).toBeInTheDocument();
    expect(screen.getByText(/Select preset persona/i)).toBeInTheDocument();
  });

  it("updates form state when selecting a preset persona", () => {
    render(
      <ScriptProvider>
        <SidebarProvider>
          <Page />
        </SidebarProvider>
      </ScriptProvider>
    );
    const classPresentationBtn = screen.getByRole("button", {
      name: /Class Presentation/i,
    });
    fireEvent.click(classPresentationBtn);

    // Check that the location select value is updated to "classroom"
    const locationSelect = screen.getByLabelText(/Location/i);
    expect(locationSelect.value).toBe("classroom");

    // Check that evaluation metrics checkboxes are set to true (example: EyeContact)
    const EyeContactCheckbox = screen.getByLabelText(/Eye Contact/i);
    expect(EyeContactCheckbox.checked).toBe(true);
  });

  it("enables the Start button when all required fields are filled and navigates on click", async () => {
    render(
      <ScriptProvider>
        <SidebarProvider>
          <Page />
        </SidebarProvider>
      </ScriptProvider>
    );
    // Fill required text fields
    const topicTextarea = screen.getByLabelText(/Presenting Topic:/i);
    fireEvent.change(topicTextarea, { target: { value: "React Testing" } });

    // Select location from dropdown
    const locationSelect = screen.getByLabelText(/Location/i);
    fireEvent.change(locationSelect, { target: { value: "online" } });

    // Select one option
    const practiceButton = screen.getByRole("button", {
      name: /Practice Now/i,
    });
    fireEvent.click(practiceButton);

    // The Start button should now be enabled
    const startButton = screen.getByRole("button", { name: /Start/i });
    expect(startButton).not.toBeDisabled();

    // Click the Start button and check that router.push is called with expected query params.
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
      // You can also check that the URL includes certain query parameters:
      const calledUrl = pushMock.mock.calls[0][0];
      expect(calledUrl).toMatch(/location=online/);
    });
  });

  it('alerts the user when no option is selected', () => {
    // Spy on window.alert
    window.alert = jest.fn();
    render(
      <ScriptProvider>
        <SidebarProvider>
          <Page />
        </SidebarProvider>
      </ScriptProvider>
    );
    // Select Preset persona but don't enter presentation topic
    const lectureBtn = screen.getByRole("button", {
      name: /Lecture/i,
    });
    fireEvent.click(lectureBtn);

    const practiceButton = screen.getByRole("button", {
      name: /Practice Now/i,
    });
    fireEvent.click(practiceButton);

    const startButton = screen.getByRole('button', { name: /Start/i });
    // Click the button without selecting entering presentation topic
    fireEvent.click(startButton);
    expect(window.alert).toHaveBeenCalledWith('Please Provide Presentation Topic');
  });
});
