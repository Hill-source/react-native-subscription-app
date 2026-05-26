import {View, Text } from 'react-native';
import {Link} from "expo-router";

const SignIn = () => {
    return (
        <View>
            <Text>Sign In</Text>
            <Link href={"/"}>Go back</Link>
        </View>
    )
}

export default SignIn;