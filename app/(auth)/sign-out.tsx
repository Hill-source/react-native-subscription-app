import {View, Text } from 'react-native';
import {Link} from "expo-router";

const SignOut = () => {
    return (
        <View>
            <Text>Sign Out</Text>
            <Link href={"/(auth)/sign-out"}>Sign Out</Link>
        </View>
    )
}

export default SignOut;