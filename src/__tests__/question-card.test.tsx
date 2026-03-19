import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuestionCard from "@/components/question-card";
import type { PreguntaDetalleDto } from "@/types";

const multipleChoiceQuestion: PreguntaDetalleDto = {
  id: "q1",
  texto: "¿Cuál es la capital de Francia?",
  tipo: 1,
  tipoNombre: "Opción Múltiple",
  orden: 1,
  puntaje: 10,
  tiempoSegundos: 120,
  explicacion: null,
  opciones: [
    { id: "o1", texto: "Madrid", orden: 1, esCorrecta: false },
    { id: "o2", texto: "París", orden: 2, esCorrecta: true },
    { id: "o3", texto: "Londres", orden: 3, esCorrecta: false },
    { id: "o4", texto: "Berlín", orden: 4, esCorrecta: false },
  ],
};

const textQuestion: PreguntaDetalleDto = {
  id: "q2",
  texto: "Explica el concepto de closures en JavaScript.",
  tipo: 2,
  tipoNombre: "Abierta",
  orden: 1,
  puntaje: 10,
  tiempoSegundos: 120,
  explicacion: null,
  opciones: [],
};

describe("QuestionCard", () => {
  it("renders multiple-choice question with options", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={multipleChoiceQuestion}
        onAnswer={onAnswer}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    expect(screen.getByText("¿Cuál es la capital de Francia?")).toBeInTheDocument();
    expect(screen.getByText("París")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();
    expect(screen.getByText("Pregunta 1 de 5")).toBeInTheDocument();
    expect(screen.getByText("Opción múltiple")).toBeInTheDocument();
  });

  it("calls onAnswer when an option is clicked", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={multipleChoiceQuestion}
        onAnswer={onAnswer}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    fireEvent.click(screen.getByText("París"));
    expect(onAnswer).toHaveBeenCalledWith("q1", "París", "o2");
  });

  it("highlights selected answer", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={multipleChoiceQuestion}
        currentAnswer="París"
        currentOpcionId="o2"
        onAnswer={onAnswer}
        questionNumber={1}
        totalQuestions={5}
      />
    );

    const parisButton = screen.getByText("París").closest("button");
    expect(parisButton?.className).toContain("border-primary");
    expect(parisButton?.className).toContain("bg-primary-light");
  });

  it("renders text question with textarea", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={textQuestion}
        onAnswer={onAnswer}
        questionNumber={2}
        totalQuestions={5}
      />
    );

    expect(screen.getByText("Respuesta abierta")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Escribe tu respuesta aquí...")
    ).toBeInTheDocument();
  });

  it("submits text answer", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={textQuestion}
        onAnswer={onAnswer}
        questionNumber={2}
        totalQuestions={5}
      />
    );

    const textarea = screen.getByPlaceholderText("Escribe tu respuesta aquí...");
    fireEvent.change(textarea, {
      target: { value: "Un closure captura variables de su scope." },
    });
    fireEvent.click(screen.getByText("Guardar respuesta"));

    expect(onAnswer).toHaveBeenCalledWith(
      "q2",
      "Un closure captura variables de su scope."
    );
  });
});
