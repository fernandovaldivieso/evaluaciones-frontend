import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Navbar from "@/components/navbar";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "1", nombre: "Test User", email: "test@test.com", rol: "Admin" },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("Navbar", () => {
  it("renders search input", () => {
    render(<Navbar />);
    expect(
      screen.getByPlaceholderText("Buscar evaluaciones, candidatos...")
    ).toBeInTheDocument();
  });

  it("renders user name and role", () => {
    render(<Navbar />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("navbar is hidden on mobile (md:flex)", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("hidden");
    expect(header?.className).toContain("md:flex");
  });

  it("uses rounded bento card style", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header");
    expect(header?.className).toContain("rounded-2xl");
    expect(header?.className).toContain("border-border");
    expect(header?.className).toContain("bg-surface");
  });

  it("search input uses semantic surface-alt background", () => {
    render(<Navbar />);
    const input = screen.getByPlaceholderText("Buscar evaluaciones, candidatos...");
    expect(input.className).toContain("bg-surface-alt");
    expect(input.className).toContain("border-border");
  });

  it("notification bell hovers with primary color", () => {
    const { container } = render(<Navbar />);
    const buttons = container.querySelectorAll("button");
    const bellBtn = buttons[0];
    expect(bellBtn?.className).toContain("hover:bg-primary-50");
    expect(bellBtn?.className).toContain("hover:text-primary");
  });
});
