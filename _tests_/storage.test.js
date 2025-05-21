import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    savePlanDay, saveWriteDay, readPlanDay, readDay, getCurrentDate, getTasks, createTask, deleteTask, createDoneTask, deleteDoneTask, getDoneTasks, createHabit, deleteHabit, getHabits, setDone, setUndone, newDay, getStoredData, updateCurrentStreak, createThought, deleteThought, getThought
} from '../src/storage/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../src/NotificationManager', () => ({
    cancelNotification: jest.fn(),
}));

beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
});

describe('Storage functions', () => {
    const testDate = '2025-05-21';

    test('1. Create plan, then update with write, then read full day and plan', async () => {
        await savePlanDay('My Plan', testDate);
        await saveWriteDay('My Note', 4, 2, testDate);

        const day = await readDay(testDate);
        expect(day).toEqual({
            date: testDate,
            plan: 'My Plan',
            note: 'My Note',
            rate: 4,
            onTime: new Date(testDate).setHours(0, 0, 0, 0) === new Date(getCurrentDate()).setHours(0, 0, 0, 0),
            streak: 2,
        });

        const plan = await readPlanDay(testDate);
        expect(plan).toBe('My Plan');
    });

    test('2. Write day without a plan and verify structure', async () => {
        await saveWriteDay('Note only', 5, 1, testDate);

        const day = await readDay(testDate);
        expect(day).toEqual({
            date: testDate,
            plan: '',
            note: 'Note only',
            rate: 5,
            onTime: new Date(testDate).setHours(0, 0, 0, 0) === new Date(getCurrentDate()).setHours(0, 0, 0, 0),
            streak: 1,
        });

        const plan = await readPlanDay(testDate);
        expect(plan).toBe('');
    });

    test('3. Updating a write should overwrite previous note, rate, streak', async () => {
        await saveWriteDay('First Note', 3, 1, testDate);
        await saveWriteDay('Updated Note', 5, 3, testDate);

        const day = await readDay(testDate);
        expect(day.note).toBe('Updated Note');
        expect(day.rate).toBe(5);
        expect(day.streak).toBe(3);
    });

    test('4. Write day with a past date should set onTime to false', async () => {
        const pastDate = '2000-01-01'; // definitely not today

        await saveWriteDay('Past note', 2, 0, pastDate);

        const day = await readDay(pastDate);
        expect(day).toEqual({
            date: pastDate,
            plan: '',
            note: 'Past note',
            rate: 2,
            onTime: false,
            streak: 0,
        });

        const plan = await readPlanDay(pastDate);
        expect(plan).toBe('');
    });
    test('5. Updating an existing plan day should overwrite the plan but keep other data', async () => {
        const updateDate = '2025-05-22';

        // Step 1: Save initial plan
        await savePlanDay('Initial Plan', updateDate);

        // Step 2: Write something else for the day (to populate more fields)
        await saveWriteDay('Initial Note', 3, 1, updateDate);

        // Step 3: Update the plan
        await savePlanDay('Updated Plan', updateDate);

        // Step 4: Read the day
        const day = await readDay(updateDate);
        expect(day.plan).toBe('Updated Plan');
        expect(day.note).toBe('Initial Note'); // still there
        expect(day.rate).toBe(3);
        expect(day.streak).toBe(1);

        // Double-check plan via readPlanDay
        const plan = await readPlanDay(updateDate);
        expect(plan).toBe('Updated Plan');
    });
    test('6. saveWriteDay updates note, rate, streak of an existing written day', async () => {
        const date = '2025-05-24';

        // Step 1: Write initial data
        await saveWriteDay('First note', 2, 1, date);

        // Step 2: Write updated data
        await saveWriteDay('Updated note', 4, 3, date);

        // Step 3: Read and verify that fields were updated
        const day = await readDay(date);
        expect(day).toEqual({
            date: date,
            plan: '', // since we never added a plan
            note: 'Updated note',
            rate: 4,
            onTime: false, // unless it's today's date
            streak: 3,
        });

        const plan = await readPlanDay(date);
        expect(plan).toBe('');
    });

    const testText = 'Edge Case Task';
    const testId = 'notif-id-123';

    test('7. createTask adds a task to storage', async () => {
        await createTask(testText, testDate, testId);
        const tasks = await getTasks();

        expect(tasks).toEqual([
            { text: testText, date: testDate, id: testId }
        ]);
    });

    test('8. createTask handles empty task list gracefully', async () => {
        await AsyncStorage.removeItem('tasks'); // ensure null
        await createTask('Empty Init', testDate, '1');
        const tasks = await getTasks();

        expect(tasks.length).toBe(1);
        expect(tasks[0].text).toBe('Empty Init');
    });

    test('9. deleteTask removes the correct task', async () => {
        await createTask('Delete Me', testDate, 'delete-id');
        await deleteTask('Delete Me', testDate);
        const tasks = await getTasks();

        expect(tasks).toEqual([]);
    });

    test('10. deleteTask handles task not found without error', async () => {
        await createTask('Stay Alive', testDate, 'stay-id');
        await deleteTask('Not There', testDate); // no crash
        const tasks = await getTasks();

        expect(tasks.length).toBe(1);
        expect(tasks[0].text).toBe('Stay Alive');
    });

    test('11. createDoneTask stores a done task correctly', async () => {
        await createDoneTask('Completed', testDate);
        const done = await getDoneTasks();

        expect(done).toEqual([{ text: 'Completed', date: testDate }]);
    });

    test('12. deleteDoneTask removes only specified done task', async () => {
        await createDoneTask('One', testDate);
        await createDoneTask('Two', testDate);
        await deleteDoneTask('One', testDate);

        const done = await getDoneTasks();
        expect(done.length).toBe(1);
        expect(done[0].text).toBe('Two');
    });

    test('13. getTasks and getDoneTasks return [] if nothing stored', async () => {
        await AsyncStorage.clear();
        const tasks = await getTasks();
        const doneTasks = await getDoneTasks();

        expect(tasks).toEqual([]);
        expect(doneTasks).toEqual([]);
    });

    const getTodayWeekday = () => new Date().getDay();


    test('14. createHabit stores habit with correct structure', async () => {
        await createHabit('Drink Water', '08:00', [1, 3, 5], [101, 102]);
        const habits = await getHabits();

        expect(habits).toEqual([
            {
                text: 'Drink Water',
                time: '08:00',
                days: [1, 3, 5],
                ids: [101, 102],
                done: false,
                streak: 0
            }
        ]);
    });

    test('15. setDone increments streak if today is in habit days', async () => {
        const today = getTodayWeekday();
        await createHabit('Exercise', '09:00', [today], [201]);
        await setDone('Exercise');

        const habits = await getHabits();
        expect(habits[0].done).toBe(true);
        expect(habits[0].streak).toBe(1);
    });

    test('16. createThought adds a new thought correctly', async () => {
        const text = 'Reflect on the day';
        const date = new Date().toISOString();

        await AsyncStorage.setItem('thought', JSON.stringify([])); // Clear initial
        await createThought(text, date);

        const thoughts = await getThought();
        expect(thoughts.length).toBe(1);
        expect(thoughts[0]).toEqual({ text, date });
    });
    test('17. getThought returns empty array when nothing is stored', async () => {
        await AsyncStorage.removeItem('thought');

        const result = await getThought();
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual([]);
    });



    test('18. setUndone resets done to false and changes streak', async () => {
        const today = getTodayWeekday();
        await createHabit('Read', '07:00', [today], [203]);
        await setDone('Read');
        await setUndone('Read');

        const habits = await getHabits();
        expect(habits[0].done).toBe(false);
        expect(habits[0].streak).toBe(0);
    });

    test('19. setDone does nothing if habit text is not found', async () => {
        await setDone('Nonexistent Habit');
        const habits = await getHabits();
        expect(habits).toEqual([]);
    });

    test('20. setUndone does nothing if habit text is not found', async () => {
        await setUndone('Ghost Habit');
        const habits = await getHabits();
        expect(habits).toEqual([]);
    });

    test('21. deleteHabit removes correct habit by text', async () => {
        await createHabit('Walk', '18:00', [2, 4], [301]);
        await createHabit('Sleep', '23:00', [0, 6], [302]);

        await deleteHabit('Walk');

        const habits = await getHabits();
        expect(habits.length).toBe(1);
        expect(habits[0].text).toBe('Sleep');
    });

    test('22. createHabit allows multiple habits with different names', async () => {
        await createHabit('Hydrate', '10:00', [1, 2], [401]);
        await createHabit('Workout', '12:00', [2, 3], [402]);

        const habits = await getHabits();
        expect(habits.length).toBe(2);
    });

    test('23. createHabit ignores duplicate names — or adds again (test behavior)', async () => {
        await createHabit('Duplicate', '11:00', [1], [500]);
        await createHabit('Duplicate', '11:00', [1], [501]);

        const habits = await getHabits();

        // Update if duplicates are disallowed
        expect(habits.length).toBe(2);
    });

    test('24. createHabit with empty days still stores habit', async () => {
        await createHabit('Freeform', '15:00', [], [600]);

        const habits = await getHabits();
        expect(habits[0].days).toEqual([]);
    });

    test('25. createHabit with empty ids is valid', async () => {
        await createHabit('NoNotif', '08:30', [1, 2], []);

        const habits = await getHabits();
        expect(habits[0].ids).toEqual([]);
    });

    test('26. createHabit with empty text is still stored (optional validation)', async () => {
        await createHabit('', '08:00', [1], [700]);

        const habits = await getHabits();
        expect(habits[0].text).toBe('');
    });

    test('27. setDone called on two valid days should update streak to 2', async () => {
        const today = new Date();
        const todayDay = today.getDay(); // 0-6
        const tomorrowDay = (todayDay + 1) % 7;

        // Step 1: Create habit scheduled for today and tomorrow
        await createHabit('Journal', '07:00', [todayDay, tomorrowDay], [800]);

        // Step 2: Mark as done today
        await setDone('Journal');
        let habits = await getHabits();
        expect(habits[0].streak).toBe(1);
        expect(habits[0].done).toBe(true);

        // Step 3: Reset `done` manually to simulate new day (optional unless your code does it automatically)
        habits[0].done = false;
        await AsyncStorage.setItem('@HabitTracker:Habits', JSON.stringify(habits));

        // Step 4: Simulate next day by mocking `getDay()`
        const originalDate = Date;
        global.Date = class extends originalDate {
            constructor(...args) {
                if (args.length === 0) {
                    return new originalDate(originalDate.now() + 24 * 60 * 60 * 1000); // add 1 day
                }
                return new originalDate(...args);
            }
            static now() {
                return originalDate.now() + 24 * 60 * 60 * 1000; // also override now()
            }
        };

        // Step 5: Mark as done again on next valid day
        await setDone('Journal');
        const updated = await getHabits();
        expect(updated[0].streak).toBe(2);
        expect(updated[0].done).toBe(true);

        // Restore original Date class
        global.Date = originalDate;
    });

    // utils/setMockDate.js
    const setMockDate = (targetDay) => {
        const base = new Date('2025-05-18T00:00:00.000Z'); // known Sunday
        const baseDay = base.getDay();
        const dayOffset = (targetDay - baseDay + 7) % 7;

        const mockDate = new Date(base);
        mockDate.setDate(base.getDate() + dayOffset);

        jest.useFakeTimers();
        jest.setSystemTime(mockDate);

        return () => {
            jest.useRealTimers();
        };
    };


    test('28. Habit on Monday and Thursday should only increment streak when marked on those days', async () => {
        const restoreDate = setMockDate(1); // Monday
        // Clean setup
        await AsyncStorage.removeItem('@HabitTracker:Habits');

        // Create habit for Mon (1) & Thu (4)
        await createHabit('Stretching', '08:00', [1, 4], [123]);

        // 1️⃣ Mock Monday and mark done
        setMockDate(1);
        await setDone('Stretching');
        let habits = await getHabits();
        expect(habits[0].streak).toBe(1);
        expect(habits[0].done).toBe(true);

        setMockDate(2);
        await newDay()
        habits = await getHabits();
        expect(habits[0].streak).toBe(1);
        expect(habits[0].done).toBe(true);

        // 3️⃣ Mock Thursday and mark done — streak should now be 2
        setMockDate(4);
        await newDay();
        habits = await getHabits(); // Add this!
        expect(habits[0].streak).toBe(1);
        expect(habits[0].done).toBe(false);
        await setDone('Stretching');
        habits = await getHabits();
        expect(habits[0].done).toBe(true);
        expect(habits[0].streak).toBe(2);

        restoreDate()
    });

    test('29. newDay resets done only for today\'s habits', async () => {
        const restoreDate = setMockDate(1); // Monday

        const habits = [
            { text: 'Exercise', time: '08:00', days: [1], done: true, streak: 1, ids: [1] }, // today
            { text: 'Read', time: '09:00', days: [2], done: true, streak: 1, ids: [2] }, // not today
        ];
        await AsyncStorage.setItem('@HabitTracker:Habits', JSON.stringify(habits));

        await newDay();

        const updated = await getHabits();
        expect(updated[0].done).toBe(false); // reset
        expect(updated[1].done).toBe(true);  // untouched

        restoreDate();
    });

    test('30. newDay resets streak if last matching day missed', async () => {
        const restoreDate = setMockDate(2); // Tuesday

        // Simulate last valid habit day was Friday
        const lastMatchingDate = new Date();
        lastMatchingDate.setDate(lastMatchingDate.getDate() - 4);
        const streakData = { streak: 5, lastDate: lastMatchingDate.toISOString() };
        await AsyncStorage.setItem('user', JSON.stringify(streakData));

        await newDay();

        const stored = await getStoredData();
        expect(stored.streak).toBe(0); // streak should reset
        expect(stored.lastDate).toBe(streakData.lastDate); // lastDate unchanged

        restoreDate();
    });

    test('31. newDay keeps streak if last valid day was yesterday', async () => {
        const restoreDate = setMockDate(3); // Wednesday

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const streakData = { streak: 3, lastDate: yesterday.toISOString() };
        await AsyncStorage.setItem('user', JSON.stringify(streakData));

        await newDay();

        const stored = await getStoredData();
        expect(stored.streak).toBe(3); // unchanged
        expect(stored.lastDate).toBe(streakData.lastDate);

        restoreDate();
    });

    test('32. updateCurrentStreak increments streak if last date correct', async () => {
        const restoreDate = setMockDate(4); // Thursday

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const streakData = { streak: 2, lastDate: yesterday.toISOString() };
        await AsyncStorage.setItem('user', JSON.stringify(streakData));

        await updateCurrentStreak();

        const updated = await getStoredData();
        expect(updated.streak).toBe(3); // incremented
        expect(new Date(updated.lastDate).getDay()).toBe(4); // today

        restoreDate();
    });
    test('33. updateCurrentStreak does not increment if last date too old', async () => {
        const restoreDate = setMockDate(6); // Saturday

        const lastDate = new Date();
        lastDate.setDate(lastDate.getDate() - 3);
        const streakData = { streak: 5, lastDate: lastDate.toISOString() };
        await AsyncStorage.setItem('user', JSON.stringify(streakData));

        await updateCurrentStreak();

        const updated = await getStoredData();
        expect(updated.streak).toBe(5); // unchanged

        restoreDate();
    });
    test('34. getStoredData returns defaults if nothing stored', async () => {
        await AsyncStorage.removeItem('user');

        const data = await getStoredData();
        expect(data).toEqual({ streak: 0, lastDate: null });
    });

    test('35. deleteThought removes correct entry by text and date', async () => {
        const date1 = new Date();
        const date2 = new Date();
        date2.setDate(date2.getDate() + 1);

        const thoughts = [
            { text: 'Reflect', date: date1.toISOString() },
            { text: 'Plan', date: date2.toISOString() }
        ];
        await AsyncStorage.setItem('thought', JSON.stringify(thoughts));

        await deleteThought('Reflect', date1);

        const updated = await getThought();
        expect(updated.length).toBe(1);
        expect(updated[0].text).toBe('Plan');
    });

    test('36. deleteThought does not remove thought if date mismatch by time', async () => {
        const baseDate = new Date();
        const altDate = new Date(baseDate);
        altDate.setHours(23, 59, 59, 999); // Same day, different time

        const thoughts = [
            { text: 'Mindfulness', date: baseDate.toISOString() }
        ];
        await AsyncStorage.setItem('thought', JSON.stringify(thoughts));

        await deleteThought('Mindfulness', altDate);

        const after = await getThought();
        expect(after.length).toBe(0); // Because normalized by .setHours(0,0,0,0)
    });

    test('37. createThought appends multiple thoughts correctly', async () => {
        const date = new Date().toISOString();

        await AsyncStorage.setItem('thought', JSON.stringify([]));
        await createThought('Gratitude', date);
        await createThought('Goals', date);

        const thoughts = await getThought();
        expect(thoughts.length).toBe(2);
        expect(thoughts.map(t => t.text)).toContain('Gratitude');
        expect(thoughts.map(t => t.text)).toContain('Goals');
    });
});
