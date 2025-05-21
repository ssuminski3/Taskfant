import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import ReadDay from '../src/pages/DayNotes/ReadDay';

jest.mock('../src/components/TasksHabits', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    DoneTaskHabits: ({ tab }) => tab?.map((item, idx) => <Text key={idx}>{item.name}</Text>),
    ThoughtList: ({ thoughts }) => thoughts?.map((item, idx) => <Text key={idx}>{item.text}</Text>),
    DoneTask: () => <Text>DoneTask</Text>,
  };
});

jest.mock('../src/storage/storage', () => ({
  getDoneTasks: jest.fn(() => Promise.resolve([{ name: 'Test Task' }])),
  getThought: jest.fn(() => Promise.resolve([{ text: 'Test Thought' }])),
  readDay: jest.fn(() => Promise.resolve({ plan: 'Plan here', note: 'Note here', rate: 6 })),
  deleteThought: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    useFocusEffect: jest.fn((cb) => cb()),
}));

describe('ReadDay', () => {
  it('renders plan, note, rate, and thoughts', async () => {
    const { getByText } = render(<ReadDay date="2025-05-20" />);
    
    await waitFor(() => {
      expect(getByText('Plan here')).toBeTruthy();
      expect(getByText('Note here')).toBeTruthy();
      expect(getByText('6')).toBeTruthy();
      expect(getByText('Test Task')).toBeTruthy();
      expect(getByText('Test Thought')).toBeTruthy();
    });
  });
});
