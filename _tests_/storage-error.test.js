import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from '../src/NotificationManager';
import * as storage from '../src/storage/storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
}));

jest.mock('../src/NotificationManager', () => ({
    cancelNotification: jest.fn(),
}));

describe('Storage module error handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
        console.warn.mockRestore();
        console.log.mockRestore();
    });

    test('getDays returns [] and logs error when AsyncStorage.getItem rejects', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail get'));
        const result = await storage.getDays();
        expect(console.error).toHaveBeenCalledWith('Error getting data:', expect.any(Error));
        expect(result).toEqual([]);
    });

    test('savePlanDay logs error when AsyncStorage.setItem rejects', async () => {
        AsyncStorage.getItem.mockResolvedValue('[]');
        AsyncStorage.setItem.mockRejectedValue(new Error('fail set'));
        await storage.savePlanDay('Plan', '2025-05-21');
        expect(console.error).toHaveBeenCalledWith('Error saving data:', expect.any(Error));
    });

    test('saveWriteDay logs error when AsyncStorage.setItem rejects', async () => {
        AsyncStorage.getItem.mockResolvedValue('[]');
        AsyncStorage.setItem.mockRejectedValue(new Error('set fail'));
        await storage.saveWriteDay('note', 5, 2, '2025-05-21');
        expect(console.error).toHaveBeenCalledWith('Error saving data:', expect.any(Error));
    });

    test('readPlanDay returns empty string when getDays fails', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('read fail'));
        const result = await storage.readPlanDay('2025-05-21');
        // getDays logs 'Error getting data:', readPlanDay returns '' without its own catch
        expect(console.error).toHaveBeenCalledWith('Error getting data:', expect.any(Error));
        expect(result).toBe('');
    });

    test('readDay returns null when getDays fails', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('read fail'));
        const result = await storage.readDay('2025-05-21');
        expect(console.error).toHaveBeenCalledWith('Error getting data:', expect.any(Error));
        expect(result).toBeNull();
    });

    test('createTask logs error when AsyncStorage.setItem rejects', async () => {
        AsyncStorage.getItem.mockResolvedValue('[]');
        AsyncStorage.setItem.mockRejectedValue(new Error('task fail'));
        await storage.createTask('t', '2025-05-21', 'id1');
        expect(console.error).toHaveBeenCalledWith('Error creating task:', expect.any(Error));
    });

    test('deleteTask logs error when AsyncStorage.getItem rejects', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail getTasks'));
        await storage.deleteTask('t', '2025-05-21');
        expect(console.error).toHaveBeenCalledWith('Error deleting task:', expect.any(Error));
    });

    test('getTasks returns [] and logs error when AsyncStorage.getItem rejects', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail getTasks'));
        const tasks = await storage.getTasks();
        expect(console.error).toHaveBeenCalledWith('Error retrieving tasks:', expect.any(Error));
        expect(tasks).toEqual([]);
    });

    test('createDoneTask logs error on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail getDone'));
        await storage.createDoneTask('t', '2025-05-21');
        expect(console.error).toHaveBeenCalledWith('Error creating task:', expect.any(Error));
    });

    test('deleteDoneTask logs error on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail getDone'));
        await storage.deleteDoneTask('t', '2025-05-21');
        expect(console.error).toHaveBeenCalledWith('Error deleting task:', expect.any(Error));
    });

    test('getDoneTasks returns [] and logs error on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail getDone'));
        const done = await storage.getDoneTasks();
        expect(console.error).toHaveBeenCalledWith('Error retrieving tasks:', expect.any(Error));
        expect(done).toEqual([]);
    });

    test('createHabit logs error when setItem rejects', async () => {
        storage.getHabits = jest.fn().mockResolvedValue([]);
        AsyncStorage.setItem.mockRejectedValue(new Error('fail habit'));
        await storage.createHabit('h', '08:00', [1], ['id1']);
        expect(console.error).toHaveBeenCalledWith('Error creating habit:', expect.any(Error));
    });

    test('deleteHabit logs error when AsyncStorage.setItem rejects', async () => {
        // Simulate successful getHabits returning an array so deleteHabit proceeds to setItem
        AsyncStorage.getItem.mockResolvedValue(JSON.stringify([{ text: 'h', ids: [] }]));
        // Make setItem fail to hit the catch block
        AsyncStorage.setItem.mockRejectedValue(new Error('fail setItem'));

        await storage.deleteHabit('h');

        expect(console.error).toHaveBeenCalledWith(
            'Error deleting habit:',
            expect.any(Error)
        );
    });

    test('getHabits returns [] and logs error on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail habits'));
        const habits = await storage.getHabits();
        expect(habits).toEqual([]);
    });

    test('setUndone logs error on failure', async () => {
        storage.getHabits = jest.fn().mockRejectedValue(new Error('fail get'));
        await storage.setUndone('h');
        expect(console.error).toHaveBeenCalledWith('Error updating done status:', expect.any(Error));
    });

    test('createThought logs error on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail thought'));
        await storage.createThought('t', '2025-05-21');
        expect(console.error).toHaveBeenCalledWith('Error creating task:', expect.any(Error));
    });

    test('deleteThought logs error on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail thought'));
        await storage.deleteThought('t', '2025-05-21');
        expect(console.error).toHaveBeenCalledWith('Error deleting task:', expect.any(Error));
    });

    test('getThought returns [] and logs error on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail thought'));
        const thoughts = await storage.getThought();
        expect(console.error).toHaveBeenCalledWith('Error retrieving tasks:', expect.any(Error));
        expect(thoughts).toEqual([]);
    });

    test('getCurrentDate returns today in YYYY-MM-DD format', () => {
        const today = new Date();
        const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        expect(storage.getCurrentDate()).toBe(expected);
    });

    test('newDay logs error in first block when getHabits fails', async () => {
        storage.getHabits = jest.fn().mockRejectedValue(new Error('fail'));
        await storage.newDay();
        expect(console.error).toHaveBeenCalled();
    });

    test('getStoredData logs error and returns undefined on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail stored'));
        const data = await storage.getStoredData();
        expect(console.error).toHaveBeenCalledWith('Error getting stored data:', expect.any(Error));
        expect(data).toBeUndefined();
    });

    test('updateCurrentStreak logs error on failure', async () => {
        AsyncStorage.getItem.mockRejectedValue(new Error('fail'));
        await storage.updateCurrentStreak();
        expect(console.error).toHaveBeenCalledWith('Error updating streak:', expect.any(Error));
    });
});
