import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PlanDay from '../src/pages/DayNotes/PlanDay';
import * as storage from '../src/storage/storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Text } from 'react-native'

// Mocks
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useFocusEffect: jest.fn((cb) => cb()),
}));

jest.mock('../src/storage/storage', () => ({
    readPlanDay: jest.fn(),
    getHabits: jest.fn(),
    getTasks: jest.fn(),
    createTask: jest.fn(),
}));

jest.mock('../src/components/TasksHabits', () => {
    const React = require('react');
    const { Text } = require('react-native');

    return {
        TaskHabitsList: ({ tab }) => {
            return tab?.length ? tab.map((item, index) => (
                <Text key={index}>{item.name || item}</Text>
            )) : null;
        },
        Task: () => <Text>Task</Text>,
        Habit: () => <Text>Habit</Text>,
    };
});


describe('PlanDay component', () => {
    const mockGoBack = jest.fn();
    const mockOnSave = jest.fn();
    const testDate = '2025-05-22';

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigation.mockReturnValue({ goBack: mockGoBack });
    });

    it('fetches and displays existing plan', async () => {
        storage.readPlanDay.mockResolvedValue('Existing plan text');
        storage.getHabits.mockResolvedValue([]);
        storage.getTasks.mockResolvedValue([]);

        const { getByPlaceholderText } = render(
            <PlanDay date={testDate} onSave={mockOnSave} />
        );

        await waitFor(() => {
            expect(getByPlaceholderText('Here write your plan').props.value).toBe('Existing plan text');
        });
    });

    it('renders task and habit lists', async () => {
        storage.readPlanDay.mockResolvedValue('');
        storage.getHabits.mockResolvedValue([{ name: 'Drink Water' }]);
        storage.getTasks.mockResolvedValue(['Buy milk']);

        const { getByText } = render(
            <PlanDay date={testDate} onSave={mockOnSave} />
        );

        await waitFor(() => {
            expect(getByText('Buy milk')).toBeTruthy();
            expect(getByText('Drink Water')).toBeTruthy();
        });
    });

    it('adds a new task', async () => {
        storage.readPlanDay.mockResolvedValue('');
        storage.getHabits.mockResolvedValue([]);
        storage.getTasks.mockResolvedValue([]);
        storage.createTask.mockResolvedValue();

        const { getByPlaceholderText, getByTestId } = render(
            <PlanDay date={testDate} onSave={mockOnSave} />
        );

        const input = getByPlaceholderText('Add Task');
        const button = getByTestId('button');

        fireEvent.changeText(input, 'New Task');
        fireEvent.press(button);

        await waitFor(() => {
            expect(storage.createTask).toHaveBeenCalledWith('New Task', testDate);
        });
    });

    it('saves the plan and calls onSave', async () => {
        storage.readPlanDay.mockResolvedValue('');
        storage.getHabits.mockResolvedValue([]);
        storage.getTasks.mockResolvedValue([]);

        const { getByText, getByPlaceholderText } = render(
            <PlanDay date={testDate} onSave={mockOnSave} />
        );

        const planInput = getByPlaceholderText('Here write your plan');
        fireEvent.changeText(planInput, 'Updated plan');

        const saveButton = getByText('Save');
        fireEvent.press(saveButton);

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith('Updated plan', testDate);
            expect(mockGoBack).toHaveBeenCalled();
        });
    });
});
