// __tests__/Page.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from "app/dashboard/eval-settings/page"; 
import { useRouter } from 'next/navigation';
import { SidebarProvider } from "@/components/ui/sidebar"

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Page Component', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: pushMock,
    });
    pushMock.mockClear();
  });

  it('renders form elements', () => {
    render(
      <SidebarProvider>
        <Page />
      </SidebarProvider>
    );
    expect(screen.getByLabelText(/Presenting about\.\.\./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Number of Attendees/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Duration \(in minutes\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Select preset persona/i)).toBeInTheDocument();
  });

  it('updates form state when selecting a preset persona', () => {
    render(
      <SidebarProvider>
        <Page />
      </SidebarProvider>
    );
    const classPresentationBtn = screen.getByRole('button', {
      name: /Class Presentation/i,
    });
    fireEvent.click(classPresentationBtn);

    // Check that the location select value is updated to "classroom"
    const locationSelect = screen.getByLabelText(/Location/i);
    expect(locationSelect.value).toBe('classroom');

    // Check that evaluation metrics checkboxes are set to true (example: eyeContact)
    const eyeContactCheckbox = screen.getByLabelText(/Eye Contact/i);
    expect(eyeContactCheckbox.checked).toBe(true);
  });

  it('disables the Start button when required fields are missing', () => {
    render(
      <SidebarProvider>
        <Page />
      </SidebarProvider>
    );
    const startButton = screen.getByRole('button', { name: /Start/i });
    expect(startButton).toBeDisabled();
  });

  it('enables the Start button when all required fields are filled and navigates on click', async () => {
    render(
      <SidebarProvider>
        <Page />
      </SidebarProvider>
    );
    // Fill required text fields
    const topicTextarea = screen.getByLabelText(/Presenting about\.\.\./i);
    fireEvent.change(topicTextarea, { target: { value: 'React Testing' } });

    const attendeesInput = screen.getByLabelText(/Number of Attendees/i);
    fireEvent.change(attendeesInput, { target: { value: '50' } });

    const durationInput = screen.getByLabelText(/Duration \(in minutes\)/i);
    fireEvent.change(durationInput, { target: { value: '30' } });

    // Select location from dropdown
    const locationSelect = screen.getByLabelText(/Location/i);
    fireEvent.change(locationSelect, { target: { value: 'online' } });

    // Select one option
    const practiceButton = screen.getByRole('button', { name: /Practice Now/i });
    fireEvent.click(practiceButton);

    // The Start button should now be enabled
    const startButton = screen.getByRole('button', { name: /Start/i });
    expect(startButton).not.toBeDisabled();

    // Click the Start button and check that router.push is called with expected query params.
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
      // You can also check that the URL includes certain query parameters:
      const calledUrl = pushMock.mock.calls[0][0];
      expect(calledUrl).toMatch(/topic=React\+Testing/);
      expect(calledUrl).toMatch(/attendees=50/);
      expect(calledUrl).toMatch(/duration=30/);
      expect(calledUrl).toMatch(/location=online/);
    });
  });

  // it('alerts the user when no option is selected', () => {
  //   // Spy on window.alert
  //   window.alert = jest.fn();
  //   render(
  //     <SidebarProvider>
  //       <Page />
  //     </SidebarProvider>
  //   );
  //   // Fill required text fields to pass validation except for the option selection
  //   fireEvent.change(screen.getByLabelText(/Presenting about\.\.\./i), { target: { value: 'Demo Topic' } });
  //   fireEvent.change(screen.getByLabelText(/Number of Attendees/i), { target: { value: '10' } });
  //   fireEvent.change(screen.getByLabelText(/Duration \(in minutes\)/i), { target: { value: '15' } });
  //   fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'online' } });

  //   const startButton = screen.getByRole('button', { name: /Start/i });
  //   // Click the button without selecting an option (practice or upload)
  //   fireEvent.click(startButton);
  //   expect(window.alert).toHaveBeenCalledWith('Please select an option');
  // });
});