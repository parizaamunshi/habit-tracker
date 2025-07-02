import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";

export default function AuthScreen() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>("");
    const theme = useTheme();

    const {signIn, signUp} = useAuth();
    const router = useRouter();
    
    const handleSwitch = () => {
        setIsSignUp((prev) => !isSignUp);
    } 

    const handleSignUp = async () => {
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }
        setError(null);

        if (isSignUp){
            const error = await signUp(email, password);
            if (error){
                setError(error);
                return;
            }
        }
        else{
            const error = await signIn(email, password);
            if (error){
                setError(error);
                return;
            }
            router.replace("/");
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={styles.content}>
                <Text style={styles.title} variant="headlineMedium">{isSignUp ? "Create Account" : "Welcome Back"}</Text>
                <TextInput 
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="example@gmail.com"
                    style={styles.input}
                    onChangeText={setEmail}
                />
                <TextInput 
                    autoCapitalize="none"
                    secureTextEntry
                    placeholder="Password"
                    style={styles.input}
                    onChangeText={setPassword}
                />
                {error && 
                    <Text style={{color : theme.colors.error}}>{error}</Text>
                }
                <Button mode="contained" style={styles.container} labelStyle={{ fontSize: 18 }} onPress={handleSignUp}>{isSignUp ? "Sign Up" : "Sign In"}</Button>
                <Button mode="text" style={{ padding: 5, alignSelf: 'center' }} onPress={handleSwitch}>{isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}</Button>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 5,
        backgroundColor: '#972b25',
        maxWidth: 125,
        maxHeight: 50,
        alignSelf: 'center'
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    input: {
        marginBottom: 20
    }
})