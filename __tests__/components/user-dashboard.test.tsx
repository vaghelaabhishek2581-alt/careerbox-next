import {
  render,
  screen,
  fireEvent,
  waitFor,
  userEvent,
  renderWithProviders,
  generateMockProfile,
  mockFetch,
  waitForLoadingToFinish,
} from "../test-utils";
import UserDashboard from "@/app/dashboard/user/page";
import { ProfileEditorModal } from "@/components/profile-editor-modal";
import { ImageUpload } from "@/components/ui/image-upload";
import type { UserProfile } from "@/lib/types/profile";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock the auth hook
jest.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: {
      id: "test-user-id",
      name: "Test User",
      email: "test@example.com",
    },
  }),
}));

describe("UserDashboard", () => {
  beforeEach(() => {
    global.fetch = mockFetch({});
  });

  it("renders loading state initially", () => {
    renderWithProviders(<UserDashboard />);
    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("renders user profile after loading", async () => {
    const mockData: Partial<UserProfile> = {
      personalDetails: {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        gender: "PREFER_NOT_TO_SAY",
        publicProfileId: "johndoe",
        professionalHeadline: "Software Engineer",
      },
      skills: ["React", "TypeScript"],
      languages: [{ name: "English", level: "FLUENT" }],
    };

    global.fetch = mockFetch(mockData);
    renderWithProviders(<UserDashboard />);

    await waitForLoadingToFinish();

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("opens profile editor modal on edit button click", async () => {
    renderWithProviders(<UserDashboard />);
    await waitForLoadingToFinish();

    const editButton = screen.getByText("Edit Profile");
    await userEvent.click(editButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("ProfileEditorModal", () => {
  const mockProfile = generateMockProfile();

  it("renders all form sections", () => {
    render(
      <ProfileEditorModal
        open={true}
        onOpenChange={() => {}}
        initialData={mockProfile}
        onUpdate={() => {}}
      />
    );

    expect(screen.getByText("Personal")).toBeInTheDocument();
    expect(screen.getByText("Images")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });

  it("handles form submissions", async () => {
    const onUpdate = jest.fn();
    render(
      <ProfileEditorModal
        open={true}
        onOpenChange={() => {}}
        initialData={mockProfile}
        onUpdate={onUpdate}
      />
    );

    const firstNameInput = screen.getByLabelText("First Name");
    await userEvent.type(firstNameInput, "Jane");
    const saveButton = screen.getByText("Save Details");
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
    });
  });
});

describe("ImageUpload", () => {
  it("handles file selection", async () => {
    const onUpload = jest.fn();
    render(<ImageUpload type="profile" onUpload={onUpload} />);

    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = screen.getByTestId("file-input");

    await userEvent.upload(input, file);

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalled();
    });
  });

  it("shows error for invalid file type", async () => {
    render(<ImageUpload type="profile" onUpload={() => {}} />);

    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const input = screen.getByTestId("file-input");

    await userEvent.upload(input, file);

    expect(screen.getByText("Please select an image file")).toBeInTheDocument();
  });
});
