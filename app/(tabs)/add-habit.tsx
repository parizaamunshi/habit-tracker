import { database, DATABASE_ID, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, TextInput, useTheme } from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddHabitScreen() {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [frequency, setFrequency] = useState<Frequency>("daily");
    const [error, setError] = useState<string | null>("");
    const router = useRouter(); 
    const { user } = useAuth();
    const theme = useTheme();   

    const handleSubmit = async () => {
        if (!user) return
        try{
            await database.createDocument(DATABASE_ID, HABITS_COLLECTION_ID, ID.unique(), {
                user_id: user.$id,
                title,
                description,
                frequency,
                streak_count: 0,
                last_completed: new Date().toISOString(),
                created_at: new Date().toISOString(),
            });
            router.back();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
                return
            }
            setError("There was an error adding the habit");
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                <TextInput 
                    label="Habit Name" 
                    mode="outlined" 
                    style={styles.input}
                    onChangeText={setTitle}
                />
                <TextInput 
                    label="Habit Description" 
                    mode="outlined" 
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    onChangeText={setDescription}
                />
                <View style={styles.frequencyContainer}>
                    <SegmentedButtons 
                        value={frequency}
                        onValueChange={(value) => setFrequency(value as Frequency)}
                        buttons={FREQUENCIES.map((freq) => ({
                            value: freq, 
                            label: freq.charAt(0).toUpperCase() + freq.slice(1).toLowerCase()
                        }))} 
                        
                    />
                </View>
                <Button 
                    mode="contained" 
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    disabled={!title || !description}
                    onPress={handleSubmit}
                >
                    Add Habit
                </Button>
                {error && <Text style={{color: theme.colors.error}}>{error}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    input: {
        marginBottom: 16,
    },
    frequencyContainer: {
        marginBottom: 24,
    },
    button: {
        borderRadius: 8,
        marginTop: 8,
    },
    buttonContent: {
        paddingVertical: 8,
    },
});