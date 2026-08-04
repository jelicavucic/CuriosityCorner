import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logoStyle}
          resizeMode="contain"
        />


      <View style={styles.buttonsStyle}>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Uloguj se</Text>
        </TouchableOpacity>

        <Text style={styles.noAccountText}>Nemaš kreiran nalog?</Text>

        <TouchableOpacity style={styles.signupButton} onPress={() => router.push('/signup')}>
          <Text style={styles.signupButtonText}>Registruj se</Text>
        </TouchableOpacity>

        <Image 
          source={require('../../assets/images/coala.png')}
          style={styles.coalaStyle}
          resizeMode='contain'
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F58C',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 42,
    color: '#C2EFEC',
    marginBottom: 24,
    textAlign: 'center',
  },
  logoStyle:{
    marginTop:-30,
    height:480,
    width:400,
    aspectRatio:1,
  },
  loginButton: {
    borderColor:'#70afbd',
    borderWidth:1,
    backgroundColor: '#C2EFEC',
    width: 300,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    color: '#ffffff',

    textShadowColor: '#735e18', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  noAccountText: {
    fontFamily: 'Baloo2_400Regular',
    color: '#F27C8D',
    marginBottom:1,
    marginLeft:20,
  },
  signupButton: {
    borderColor:'#2b977a',
    borderWidth:1,
    backgroundColor: '#9ADFCD',
    width: 300,
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
  },
  signupButtonText: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    color: '#F27C8D',

    textShadowColor: '#453a14', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonsStyle:{
    marginTop:30,
  },
  coalaStyle:{
    width:120,
    height:180,
    right:-200,
    marginTop:-140,

  },
});