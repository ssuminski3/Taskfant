import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import StartingPage from '../src/pages/StartingPage/StartingPage';
import * as storage from '../src/storage/storage';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: mockNavigate }),
    useFocusEffect: jest.fn((cb) => cb()), // call the effect immediately
}));

jest.mock('../src/storage/storage', () => ({
    newDay: jest.fn(),
    getStreak: jest.fn(),
    setStreak: jest.fn(),
    getThought: jest.fn(),
    getStoredData: jest.fn(),
}));

jest.mock('../src/components/TasksHabits', () => ({
    ThoughtList: () => null,
}));

describe('StartingPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls newDay and sets streak on mount', async () => {
        storage.newDay.mockResolvedValue();
        storage.getStoredData.mockResolvedValue({ streak: 3 });

        render(<StartingPage />);

        await waitFor(() => {
            expect(storage.newDay).toHaveBeenCalled();
        });
    });

    it('renders streak text correctly', async () => {
        storage.getStoredData.mockResolvedValue({ streak: 3 });

        const { getByText } = render(<StartingPage />);
        await waitFor(() => {
            expect(getByText('Journaling streak:')).toBeTruthy();
            expect(getByText('3')).toBeTruthy();
            expect(getByText('days')).toBeTruthy();
        });
    });

    it("navigates to DayPage when button is pressed", async () => {
        storage.getStoredData.mockResolvedValue({ streak: 3 });

        const { getByText } = render(<StartingPage />);
        const button = getByText("Write today's note");

        fireEvent.press(button);

        expect(mockNavigate).toHaveBeenCalledWith(
            expect.stringMatching('DayPage'),
            expect.any(Object)
        );
    });

    it('renders fire image when streak is greater than 6', async () => {
        storage.getStoredData.mockResolvedValue({ streak: 7 });

        const { findByTestId } = render(<StartingPage />);
        const image = await findByTestId('streak-fire-image');
        expect(image).toBeTruthy();
    });
});
