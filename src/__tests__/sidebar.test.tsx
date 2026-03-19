import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "@/components/sidebar";

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

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Sidebar", () => {
  it("renders navigation items", () => {
    render(<Sidebar />);
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Evaluaciones").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ranking").length).toBeGreaterThan(0);
  });

  it("renders EvalSystem brand in header", () => {
    render(<Sidebar />);
    expect(screen.getAllByText("EvalSystem").length).toBeGreaterThan(0);
  });

  it("renders mobile hamburger trigger", () => {
    render(<Sidebar />);
    expect(screen.getByLabelText("Abrir menú")).toBeInTheDocument();
  });

  it("sidebar uses floating rounded card with border", () => {
    const { container } = render(<Sidebar />);
    const desktopSidebar = container.querySelectorAll("aside");
    const desktop = Array.from(desktopSidebar).find((el) =>
      el.className.includes("md:block")
    );
    expect(desktop).toBeDefined();
    // Inner card should have rounded corners
    const card = desktop?.querySelector("div");
    expect(card?.className).toContain("rounded-2xl");
    expect(card?.className).toContain("bg-primary");
  });

  it("shows user name and avatar in footer", () => {
    render(<Sidebar />);
    expect(screen.getAllByText("Test User").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
    // Initials avatar
    expect(screen.getAllByText("TU").length).toBeGreaterThan(0);
  });

  it("logout button has accent hover state", () => {
    render(<Sidebar />);
    const logoutBtns = screen.getAllByText("Cerrar sesión");
    const btn = logoutBtns[0]?.closest("button");
    expect(btn?.className).toContain("hover:bg-white/10");
    expect(btn?.className).toContain("hover:text-white");
  });
});
