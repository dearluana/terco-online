import { render, screen } from "@testing-library/react";
import MenuTercos from "../MenuTercos";

const sample = [
  {
    id: "sample-1",
    title: "Terco de Exemplo - Completo",
    subtitle: "Texto simples",
    steps: [{ label: "Parte 1", text: "Conteudo" }],
  },
];

describe("MenuTercos", () => {
  it("renders cards without the 'Completo' suffix", () => {
    render(<MenuTercos tercos={sample} onSelect={() => {}} />);

    expect(screen.getByText("Terco de Exemplo")).toBeInTheDocument();
    expect(screen.queryByText(/Completo/i)).not.toBeInTheDocument();
    expect(screen.getByText("Texto simples")).toBeInTheDocument();
    expect(screen.getByText("Rezar")).toBeInTheDocument();
  });
});
