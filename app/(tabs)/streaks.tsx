import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { database, DATABASE_ID, HABITS_COLLECTION_ID } from "../../lib/appwrite";
import { useAuth } from "../../lib/auth-context";
import type { Habit } from "../../types/database.type";

export default function StreaksScreen() {
    const { user, isLoadingUser } = useAuth();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        database.listDocuments(DATABASE_ID, HABITS_COLLECTION_ID, [
        ]).then((res: any) => {
            const docs = res.documents as Habit[];
            setHabits(docs.filter(h => h.user_id === user.$id));
        }).catch(() => setHabits([])).finally(() => setLoading(false));
    }, [user]);

    const markAsComplete = async (habit: Habit) => {
        if (!user) return;
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        let alreadyCompleted = false;
        let shouldIncrement = false;

        if (habit.last_completed) {
            const last = new Date(habit.last_completed);
            if (habit.frequency === 'daily') {
                alreadyCompleted = habit.last_completed.slice(0, 10) === todayStr;
                shouldIncrement = isYesterday(habit.last_completed);
            } else if (habit.frequency === 'weekly') {
                alreadyCompleted = isSameWeek(today, last);
                shouldIncrement = isPreviousWeek(today, last);
            } else if (habit.frequency === 'monthly') {
                alreadyCompleted = isSameMonth(today, last);
                shouldIncrement = isPreviousMonth(today, last);
            }
        }

        if (alreadyCompleted) {
            Alert.alert("Already completed", `You've already marked this habit as complete for this ${habit.frequency}.`);
            return;
        }
        setMarking(habit.$id);
        try {
            await database.updateDocument(
                DATABASE_ID,
                HABITS_COLLECTION_ID,
                habit.$id,
                {
                    last_completed: todayStr,
                    streak_count: shouldIncrement ? habit.streak_count + 1 : 1,
                }
            );
            const res: any = await database.listDocuments(DATABASE_ID, HABITS_COLLECTION_ID, []);
            const docs = res.documents as Habit[];
            setHabits(docs.filter(h => h.user_id === user.$id));
        } catch (e) {
            Alert.alert("Error", "Could not mark as complete.");
        } finally {
            setMarking(null);
        }
    };

    function isYesterday(dateStr: string) {
        const d = new Date(dateStr);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return d.getFullYear() === yesterday.getFullYear() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getDate() === yesterday.getDate();
    }
    function isSameWeek(a: Date, b: Date) {
        const getWeek = (d: Date) => {
            const date = new Date(d.getTime());
            date.setHours(0,0,0,0);
            date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
            return date.getTime();
        };
        return getWeek(a) === getWeek(b);
    }
    function isPreviousWeek(a: Date, b: Date) {
        const getWeek = (d: Date) => {
            const date = new Date(d.getTime());
            date.setHours(0,0,0,0);
            date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
            return date.getTime();
        };
        return getWeek(a) - getWeek(b) === 7 * 24 * 60 * 60 * 1000;
    }
    function isSameMonth(a: Date, b: Date) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
    }
    function isPreviousMonth(a: Date, b: Date) {
        return (
            (a.getFullYear() === b.getFullYear() && a.getMonth() - b.getMonth() === 1) ||
            (a.getFullYear() - b.getFullYear() === 1 && b.getMonth() === 11 && a.getMonth() === 0)
        );
    }
    if (habits.length === 0) {
        return <View style={styles.container}><Text>No habits found.</Text></View>;
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {habits.map(habit => (
                <View style={styles.card} key={habit.$id}>
                    <Text style={styles.frequency}>{habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}</Text>
                    <MaterialCommunityIcons name="fire" size={36} color="#ff9800" />
                    <Text style={styles.streakText}>{habit.title}</Text>
                    <Text style={styles.streakNumber}>
                        {habit.streak_count} {habit.streak_count > 1 ? "days" : "day"}
                    </Text>
                    <Text style={styles.subtitle}>Last completed: {habit.last_completed ? habit.last_completed.slice(0, 10) : "Never"}</Text>
                    {(() => {
                        let alreadyCompleted = false;
                        const today = new Date();
                        const todayStr = today.toISOString().slice(0, 10);
                        if (habit.last_completed) {
                            const last = new Date(habit.last_completed);
                            if (habit.frequency === 'daily') {
                                alreadyCompleted = habit.last_completed.slice(0, 10) === todayStr;
                            } else if (habit.frequency === 'weekly') {
                                alreadyCompleted = isSameWeek(today, last);
                            } else if (habit.frequency === 'monthly') {
                                alreadyCompleted = isSameMonth(today, last);
                            }
                        }
                        return (
                            <Button
                                mode="contained"
                                style={[styles.button, alreadyCompleted && { backgroundColor: '#b0b0b0' }]}
                                labelStyle={{ color: "white", fontSize: 16 }}
                                onPress={() => markAsComplete(habit)}
                                disabled={marking === habit.$id || alreadyCompleted}
                                loading={marking === habit.$id}
                            >
                                {alreadyCompleted ? "Marked" : marking === habit.$id ? "Marking..." : "Mark as Complete"}
                            </Button>
                        );
                    })()}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        padding: 20,
    },
    frequency: {
        backgroundColor: '#c0dafc',
        fontWeight: 'bold',
        fontSize: 13,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 24,
        color: "#222",
    },
    card: {
        backgroundColor: "#edf5ff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        width: 300,
        borderWidth: 1,
        borderColor: "#c0dafc",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    streakText: {
        fontSize: 20,
        color: "#555",
        marginTop: 8,
        fontWeight: "600",
    },
    streakNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ff9800",
        marginTop: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "400",
        marginTop: 12,
        marginBottom: 8,
        color: "#333",
    },
    button: {
        backgroundColor: "#649ade",
        marginTop: 12,
        borderRadius: 30,
        padding: 5,
        width: 200,
        alignItems: "center",
        justifyContent: "center",
    }
});
