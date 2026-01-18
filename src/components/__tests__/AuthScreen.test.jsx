import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AuthScreen from "../AuthScreen";

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
}));

vi.mock("../../services/firebase", () => ({
  auth: {},
}));

describe("AuthScreen", () => {
  it("toggles between login and register modes", async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    expect(screen.getByText("Bem-vindo de volta")).toBeInTheDocument();
    expect(screen.getByText("Ainda nao tem conta? Cadastre-se.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ainda nao tem conta? Cadastre-se." }));

    expect(screen.getByText("Crie sua conta")).toBeInTheDocument();
    expect(screen.getByText("Ja tem conta? Acesse.")).toBeInTheDocument();
  });
});
