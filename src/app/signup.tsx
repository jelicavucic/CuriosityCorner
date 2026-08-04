import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ageGroups = ['4 - 5 godina', '6 - 7 godina', '8 - 9 godina', '9 + godina'];


export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const handleRegister = () => {
  // ovde ide tvoja validacija, čuvanje u bazi itd.

  router.push({
    pathname: '/login', // ili putanja do tvog login fajla
    params: {
      noviNalog: username, // ime koje je korisnik uneo
    },
  });
};


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source = {require('../../assets/images/back.png')}
          style={styles.backIcon}
          resizeMode='contain'
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/')}>
              <Image
               source={require('../../assets/images/menu.png')}
               style={styles.menuIcon}
               resizeMode="contain"
              />
            </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Dobrodošli!</Text>

        <Image
          source={require('../../assets/images/birds.png')}
          style={styles.birdIcon}
          resizeMode='contain'
        />

        <Image
          source={require('../../assets/images/children.png')}
          style={styles.childIcon}
          resizeMode='contain'
        />

        <Image
          source={require('../../assets/images/baloons.png')}
          style={styles.baloonIcon}
          resizeMode='contain'
        />

        <Text style={styles.label}>Unesite ime:</Text>
        <TextInput style={styles.input} placeholder="Ime:" value={name} onChangeText={setName} />

        <Text style={styles.label}>Unesite korisničko ime:</Text>
        <TextInput
          style={styles.input}
          placeholder="Korisničko ime:"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Izaberite starosnu dob:</Text>
        {ageGroups.map((age) => (
          <TouchableOpacity key={age} style={styles.radioRow} onPress={() => setSelectedAge(age)}>
            <View style={styles.radioCircle}>
              {selectedAge === age && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>{age}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.signupButton} onPress={handleRegister}>
          <Text style={styles.signupButtonText}>Registrujte se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9ADFCD', padding: 24, paddingTop: 60 },
 menuButton:{
    top:-60,
    right:50,
  },
  menuIcon:{
    height:90,
    width:150,
  },
  backButton: {
    top: 5,
    right:-270,
  },
  backIcon:{
    height:50,
    width:100,
  },
  card: {
    flex: 1,
    backgroundColor: '#F2F58C',
    borderWidth: 4,
    borderColor: '#F4A261',
    padding: 10,
    marginTop: -75,
  },
  title: {
    marginTop:60,
    fontFamily: 'Baloo2_700Bold',
    fontSize: 22,
    color: '#F27C8D',
    textAlign: 'center',
    marginBottom: 30,
    

    textShadowColor: '#92cff0', 
    textShadowOffset: { width: 2, height: 1 },
    textShadowRadius: 3,


  },
  label: {
    fontFamily: 'Baloo2_700',
    color: '#F27C8D',
    marginBottom: 10,
    marginTop: 10,
    fontSize:12,
    marginLeft:40,

    textShadowColor: '#c6dfed', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dob:{
    fontFamily: 'Baloo2_700',
    color: '#F27C8D',
    marginBottom: 10,
    marginTop: 10,
    fontSize:12,
    marginLeft:20,

    textShadowColor: '#c6dfed', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  input: {
    backgroundColor: '#C2EFEC',
    borderRadius: 40,
    padding: 14,
    fontFamily: 'Baloo2_400Regular',
    marginTop:-10,
    marginBottom:14,
    width:250,
    marginLeft:23,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
    marginLeft:45,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#39cec4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'#ffffff',
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C2EFEC',
  },
  radioLabel: {
    fontFamily: 'Baloo2_700Bold',
    color: '#F27C8D',
  },
  signupButton: {
    backgroundColor: '#C2EFEC',
    paddingVertical: 16,
    borderRadius: 70,
    alignItems: 'center',
    alignSelf: 'center',
    width: 110,
    height: 110,
    justifyContent: 'center',
    marginTop: 30,
    borderColor:'#FCD0C5',
    borderWidth:4,
  },
  signupButtonText: {
    fontFamily: 'Baloo2_700Bold',
    color: '#ffffff',
    fontSize: 17,
    textAlign: 'center',

    textShadowColor: '#c08d1e', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,

  },
  birdIcon:{
    width:141,
    height:136,
    position:'absolute',
    right:-50,
    top:30,
  },
  childIcon:{
    width:470,
    height:250,
    position:'absolute',
    bottom:-60,
    left:-60,

  },
  baloonIcon:{
    width:200,
    height:220,
    position:'absolute',
    left:-70,
    top:-50,
  },
});