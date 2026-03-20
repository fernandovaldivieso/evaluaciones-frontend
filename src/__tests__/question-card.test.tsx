import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuestionCard from "@/components/question-card";
import type { PreguntaParaCandidatoDto } from "@/types";

const multipleChoiceQuestion: PreguntaParaCandidatoDto = {
  id: "q1",
  texto: "¿Cuál es la capital de Francia?",
  tipo: 1,
  tipoNombre: "Opción Múltiple",
  orden: 1,
  puntaje: 10,
  tiempoSegundos: 120,
  opciones: [
    { id: "o1", texto: "Madrid", orden: 1 },
    { id: "o2", texto: "París", orden: 2 },
    { id: "o3", texto: "Londres", orden: 3 },
    { id: "o4", texto: "Berlín", orden: 4 },
  ],
};

const textQuestion: PreguntaParaCandidatoDto = {
  id: "q2",
  texto: "Explica el concepto de closures en JavaScript.",
  tipo: 2,
  tipoNombre: "Abierta",
  orden: 1,
  puntaje: 10,
  tiempoSegundos: 120,
  opciones: [],
};

const codeQuestion: PreguntaParaCandidatoDto = {
  id: "q3",
  texto: "Implementa una función de fibonacci",
  tipo: 3,
  tipoNombre: "Código",
  orden: 1,
  puntaje: 20,
  tiempoSegundos: 300,
  opciones: null,
};

const trueFalseQuestion: PreguntaParaCandidatoDto = {
  id: "q4",
  texto: "JavaScript es un lenguaje compilado",
  tipo: 4,
  tipoNombre: "Verdadero/Falso",
  orden: 1,
  puntaje: 5,
  tiempoSegundos: 60,
  opciones: [
    { id: "tf1", texto: "Verdadero", orden: 1 },
    { id: "tf2", texto: "Falso", orden: 2 },
  ],
};

describe("QuestionCard", () => {
  it("renders multiple-choice question with options and type badge", () => {
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
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    expect(screen.getByText("Opción múltiple")).toBeInTheDocument();
    // Points badge
    expect(screen.getByText("10 puntos")).toBeInTheDocument();
  });

  it("calls onAnswer with option text and id when an option is clicked", () => {
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

  it("highlights selected answer with check icon", () => {
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

  it("submits text answer on button click", () => {
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

  it("renders code question with editor style (dark header)", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={codeQuestion}
        onAnswer={onAnswer}
        questionNumber={3}
        totalQuestions={5}
      />
    );

    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("20 puntos")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("// Escribe tu código aquí...")).toBeInTheDocument();
  });

  it("renders true/false question as option buttons", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={trueFalseQuestion}
        onAnswer={onAnswer}
        questionNumber={4}
        totalQuestions={5}
      />
    );

    expect(screen.getByText("Verdadero / Falso")).toBeInTheDocument();
    expect(screen.getByText("Verdadero")).toBeInTheDocument();
    expect(screen.getByText("Falso")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Falso"));
    expect(onAnswer).toHaveBeenCalledWith("q4", "Falso", "tf2");
  });

  it("shows saved indicator when isSaved is true", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={multipleChoiceQuestion}
        currentAnswer="París"
        currentOpcionId="o2"
        onAnswer={onAnswer}
        questionNumber={1}
        totalQuestions={5}
        isSaved={true}
      />
    );

    expect(screen.getByText("Guardada")).toBeInTheDocument();
  });

  it("disables submit button when textarea is empty", () => {
    const onAnswer = vi.fn();
    render(
      <QuestionCard
        question={textQuestion}
        onAnswer={onAnswer}
        questionNumber={2}
        totalQuestions={5}
      />
    );

    const submitButton = screen.getByText("Guardar respuesta");
    expect(submitButton).toBeDisabled();
  });

  it("shows character count when typing", () => {
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
    fireEvent.change(textarea, { target: { value: "Hello world" } });
    expect(screen.getByText("11 caracteres")).toBeInTheDocument();
  });
});
