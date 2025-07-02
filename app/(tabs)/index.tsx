import { DATABASE_ID, HABITS_COLLECTION_ID, database } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Swipeable } from 'react-native-gesture-handler';

export default function Index() {
  const {user} = useAuth();

  const [habits, setHabits] = useState<Habit[]>();

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try{
      const response = await database.listDocuments(
        DATABASE_ID, 
        HABITS_COLLECTION_ID, 
        [Query.equal("user_id", user?.$id ?? "")]) 
      setHabits(response.documents as Habit[])
    } catch (error) {
      console.log(error)
    } 
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await database.deleteDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId
      );
      setHabits((prev) => prev?.filter((h) => h.$id !== habitId));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete habit.');
    }
  };

  const renderRightActions = (habitId: string) => (
    <View style={{ justifyContent: 'center', alignItems: 'flex-end', flex: 1 }}>
      <MaterialCommunityIcons
        name="delete"
        size={32}
        color="#ff5252"
        style={{ backgroundColor: '#fff', padding: 20, borderRadius: 20, marginRight: 10 }}
        onPress={() => {
          Alert.alert(
            'Delete Habit',
            'Are you sure you want to delete this habit?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => handleDeleteHabit(habitId) },
            ]
          );
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.habitsList}
        renderItem={({ item }) => (
          <Swipeable renderRightActions={() => renderRightActions(item.$id)}>
            <View style={styles.habitCard}>
              <Text style={styles.habitTitle}>{item.title}</Text>
              <Text style={styles.habitDescription}>{item.description}</Text>
              <View style={styles.streakRow}>
                <Text style={styles.habitStreak}>
                  🔥 {item.streak_count}{" "}
                  {item.frequency === "daily"
                    ? "days streak"
                    : item.frequency === "weekly"
                    ? "weeks streak"
                    : item.frequency === "monthly"
                    ? "months streak"
                    : "streak"}
                </Text>
                <Text style={styles.habitFrequency}>
                  {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1).toLowerCase()}
                </Text>
              </View>
            </View>
          </Swipeable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No habits for today yet.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    paddingBottom:0
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  signOutButton: {
    alignSelf: 'center',
    marginBottom: 24,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  habitsList: {
    paddingBottom: 24,
  },
  habitCard: {
    backgroundColor: '#f4f0ff',
    borderRadius: 20,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#daccff',
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  habitDescription: {
    fontSize: 15,
    color: '#666',
    marginBottom: 10,
  },
  habitStreak: {
    alignSelf: 'flex-start',
    fontSize: 13,
    color: '#888',
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffda9e',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  habitFrequency: {
    alignSelf: 'flex-end',
    fontSize: 13,
    color: '#ffffff',
    backgroundColor: '#b9b0d1',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#988fb3',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 32,
    fontSize: 16,
  },
});