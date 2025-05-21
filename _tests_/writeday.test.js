import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WriteDay from '../src/pages/DayNotes/WriteDay';

jest.mock('../src/components/TasksHabits', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
        DoneTaskHabits: () => <Text>DoneTaskHabits</Text>,
        DoneTask: () => <Text>DoneTask</Text>,
        Task: () => <Text>Task</Text>,
        Habit: () => <Text>Habit</Text>,
        TaskHabitsList: () => <Text>TaskHabitsList</Text>,
    };
});

const mockSetUserStreak = jest.fn();
const mockGoBack = jest.fn();

jest.mock('../src/storage/storage', () => ({
    readDay: jest.fn(() => Promise.resolve({ plan: 'Plan today', note: 'Initial note', rate: 5 })),
    getDoneTasks: jest.fn(() => Promise.resolve([{ name: 'Done Task' }])),
    getTasks: jest.fn(() => Promise.resolve([{ name: 'Task' }])),
    getHabits: jest.fn(() => Promise.resolve([{ name: 'Habit' }])),
    setUserStreak: mockSetUserStreak,
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            goBack: mockGoBack,
        }),
        useFocusEffect: (cb) => cb(),
    };
});

describe('WriteDay', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders note, plan, and rate, and handles save', async () => {
        const mockOnSave = jest.fn();
        const { getByPlaceholderText, getByText, getByTestId } = render(
            <WriteDay date="2025-05-21" onSave={mockOnSave} />
        );

        await waitFor(() => {
            expect(getByText('Plan today')).toBeTruthy();
            expect(getByTestId('note-input').props.value).toBe('Initial note');
            expect(getByTestId('selected-rate').props.children).toBe(5);

        });

        fireEvent.changeText(getByPlaceholderText('Add Note'), 'Updated Note');
        fireEvent.press(getByText('8'));
        fireEvent.press(getByText('Save'));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith('Updated Note', 8, 3, '2025-05-21');
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('does NOT call setUserStreak if not today or empty note', async () => {
        const { getByText } = render(<WriteDay date="2023-01-01" onSave={jest.fn()} />);

        await waitFor(() => {
            expect(getByText('Plan today')).toBeTruthy();
        });

        fireEvent.press(getByText('Save'));

        expect(mockSetUserStreak).not.toHaveBeenCalled();
    });

    it('shows placeholder text when rate is null', async () => {
        const { getByTestId } = render(
            <WriteDay date="2025-05-22" onSave={jest.fn()} />
        );

        await waitFor(() => {
            expect(getByTestId('selected-rate').props.children).toBe('Rate your day');
        });
    });


});
