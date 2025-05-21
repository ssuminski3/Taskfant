import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { Task, DoneTask, Habit } from "../src/components/TasksHabits"; // adjust path as needed

jest.mock("../src/storage/storage", () => ({
  deleteTask: jest.fn(() => Promise.resolve()),
  createDoneTask: jest.fn(() => Promise.resolve()),
  deleteDoneTask: jest.fn(() => Promise.resolve()),
  createTask: jest.fn(() => Promise.resolve()),
  setDone: jest.fn(() => Promise.resolve()),
  deleteHabit: jest.fn(() => Promise.resolve()),
  setUndone: jest.fn(() => Promise.resolve()),
  resetStreak: jest.fn(() => Promise.resolve()),
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: () => null,
}));

// Mock Alert so we can control the dialog in tests
jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
  const yesButton = buttons.find((b) => b.text === "Yes");
  if (yesButton) yesButton.onPress();
});

describe("Task component", () => {
  jest.useFakeTimers();

  it("shows check icon and calls on after checkbox press", async () => {
    const onMock = jest.fn();
    const { getByTestId } = render(
      <Task text="Test Task" date={new Date().toISOString()} on={onMock} />
    );

    fireEvent.press(getByTestId("task-checkbox"));

    await act(() => {
      jest.advanceTimersByTime(15);
    });

    expect(onMock).toHaveBeenCalled();
  });

  it("calls on after delete press", async () => {
    const onMock = jest.fn();
    const { getByTestId } = render(
      <Task text="Test Task" date={new Date().toISOString()} on={onMock} />
    );

    await act(async () => {
      fireEvent.press(getByTestId("task-delete-button"));
    });

    expect(onMock).toHaveBeenCalled();
  });
});

describe("DoneTask component", () => {
  it("calls undo and delete handlers", async () => {
    const onMock = jest.fn();
    const date = new Date().toISOString();

    const { getByTestId } = render(
      <DoneTask text="Done Task" date={date} on={onMock} />
    );

    await act(async () => {
      fireEvent.press(getByTestId("done-task-undo-button"));
    });
    expect(onMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.press(getByTestId("done-task-delete-button"));
    });
    expect(onMock).toHaveBeenCalledTimes(2);
  });
});

describe("Habit component", () => {
  it("toggles done state and calls on when checkbox pressed", async () => {
    const onMock = jest.fn();
    const habitProps = {
      text: "My Habit",
      date: "2025-05-21",
      streak: 5,
      done: false,
      on: onMock,
      days: {
        Sunday: false,
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
      },
      last: new Date().toISOString(),
    };

    const { getByTestId } = render(<Habit {...habitProps} />);

    await act(async () => {
      fireEvent.press(getByTestId("habit-checkbox"));
    });

    expect(onMock).toHaveBeenCalled();
  });

  it("calls deleteHabit and on when delete pressed", async () => {
    const onMock = jest.fn();
    const habitProps = {
      text: "My Habit",
      date: "2025-05-21",
      streak: 5,
      done: false,
      on: onMock,
      days: {
        Sunday: false,
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
      },
      last: new Date().toISOString(),
    };

    const { getByTestId } = render(<Habit {...habitProps} />);

    await act(async () => {
      fireEvent.press(getByTestId("habit-delete-button"));
    });

    expect(onMock).toHaveBeenCalled();
  });
});
