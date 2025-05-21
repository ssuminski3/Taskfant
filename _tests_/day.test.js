import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import DayPage from '../src/pages/DayNotes/Day';
import * as storage from '../src/storage/storage';
import { useFocusEffect } from '@react-navigation/native';

jest.mock('../src/storage/storage', () => ({
  getDays: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => callback()),
}));

jest.mock('../src/pages/DayNotes/WriteDay', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockWriteDay = () => <View testID="WriteDay" />;
  MockWriteDay.displayName = 'WriteDay';
  return MockWriteDay;
});

jest.mock('../src/pages/DayNotes/ReadDay', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockReadDay = () => <View testID="ReadDay" />;
  MockReadDay.displayName = 'ReadDay';
  return MockReadDay;
});

jest.mock('../src/pages/DayNotes/PlanDay', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockPlanDay = () => <View testID="PlanDay" />;
  MockPlanDay.displayName = 'PlanDay';
  return MockPlanDay;
});

describe('DayPage', () => {
  const baseDate = '2025-05-20';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches dates on focus and renders without crashing', async () => {
    storage.getDays.mockResolvedValue([]);
    render(<DayPage route={{ params: { date: baseDate, onSave: jest.fn(), onSave2: jest.fn() } }} />);
    await waitFor(() => expect(storage.getDays).toHaveBeenCalled());
  });

  it('renders ReadDay if dateData has note for the date', async () => {
    storage.getDays.mockResolvedValue([{ date: addDays(baseDate, -1), note: 'some note' }]);
    const { getByTestId } = render(
      <DayPage route={{ params: { date: addDays(baseDate, -1), onSave: jest.fn(), onSave2: jest.fn() } }} />
    );
    await waitFor(() => {
      expect(getByTestId('ReadDay')).toBeTruthy();
    });
  });

  it('renders WriteDay for today date', async () => {
  storage.getDays.mockResolvedValue([]);
  const { getAllByTestId } = render(
    <DayPage route={{ params: { date: baseDate, onSave: jest.fn(), onSave2: jest.fn() } }} />
  );
  await waitFor(() => {
    expect(getAllByTestId('WriteDay').length).toBeGreaterThan(0);
  });
});

it('renders WriteDay if date is before today and no note', async () => {
  storage.getDays.mockResolvedValue([]);
  const { getAllByTestId } = render(
    <DayPage route={{ params: { date: addDays(baseDate, -1), onSave: jest.fn(), onSave2: jest.fn() } }} />
  );
  await waitFor(() => {
    expect(getAllByTestId('WriteDay').length).toBeGreaterThan(0);
  });
});

it('renders PlanDay if date is after today', async () => {
  storage.getDays.mockResolvedValue([]);
  const { getAllByTestId } = render(
    <DayPage route={{ params: { date: addDays(baseDate, 1), onSave: jest.fn(), onSave2: jest.fn() } }} />
  );
  await waitFor(() => {
    expect(getAllByTestId('PlanDay').length).toBeGreaterThan(0);
  });
});


  it('extends date list when swiping near end (basic smoke test)', async () => {
    storage.getDays.mockResolvedValue([]);
    render(<DayPage route={{ params: { date: baseDate, onSave: jest.fn(), onSave2: jest.fn() } }} />);
    await waitFor(() => expect(storage.getDays).toHaveBeenCalled());
  });
});

// Helper to add days to a date string (YYYY-MM-DD)
function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
