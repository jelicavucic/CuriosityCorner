import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

const avatars = [
  require('../../assets/images/avatar1.png'),
  require('../../assets/images/avatar2.png'),
  require('../../assets/images/avatar3.png'),
];

// Dimenzije petougla - krugovi se raspoređuju po zamišljenom krugu i povezuju linijama
const PENTAGON_SIZE = 280;
const CENTER = PENTAGON_SIZE / 2;
const RADIUS = 105;
const CIRCLE_SIZE = 90;

// 5 tačaka ravnomerno raspoređenih po krugu (počevši od vrha, u smeru kazaljke)
const pentagonPoints = [0, 1, 2, 3, 4].map((i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
});

type Profile = {
  name: string;
  color: string;
  avatar: any;
} | null;

export default function LoginScreen() {
  const router = useRouter();

  const { noviNalog } = useLocalSearchParams<{ noviNalog?: string | string[] }>();

  // 5 mesta u petouglu: 3 postojeća naloga (bez avatara na početku) + 2 prazna mesta
  const [profiles, setProfiles] = useState<Profile[]>([
    { name: 'Marija', color: '#F27C8D', avatar: null },
    { name: 'Milan', color: '#4472C4', avatar: null },
    { name: 'Jakov', color: '#3CB878', avatar: null },
    null,
    null,
  ]);

  useFocusEffect(
    useCallback(() => {
      // noviNalog moze biti string, niz ili undefined - normalizuj
      const ime = Array.isArray(noviNalog) ? noviNalog[0] : noviNalog;

      if (ime && ime.trim().length > 0) {
        setProfiles((prev) => {
          // ne dodaj opet ako profil sa tim imenom vec postoji
          const vecPostoji = prev.some((p) => p?.name === ime.trim());
          if (vecPostoji) return prev;

          const praznoMesto = prev.findIndex((p) => p === null);
          if (praznoMesto === -1) return prev;

          const boje = ['#F27C8D', '#4472C4', '#3CB878', '#F2A93B', '#9B59B6'];

          const novi = [...prev];
          novi[praznoMesto] = {
            name: ime.trim(),
            color: boje[praznoMesto],
            avatar: null,
          };
          return novi;
        });

        // ocisti parametar da se profil ne bi ponovo dodao pri sledecem fokusu
        router.setParams({ noviNalog: undefined });
      }
    }, [noviNalog])
  );

  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [avatarPickIndex, setAvatarPickIndex] = useState<number | null>(null);

  // ... ostatak komponente (otvoriIzborAvatara, izaberiAvatar, udjiUIgru, kliknutoNaProfil, return...) ostaje isti

  const otvoriIzborAvatara = (index: number) => {
    setAvatarPickIndex(index);
    setAvatarModalVisible(true);
  };

  const izaberiAvatar = (avatar: any) => {
    if (avatarPickIndex === null) return;

    const noviProfili = [...profiles];
    const profil = noviProfili[avatarPickIndex];

    if (profil) {
      noviProfili[avatarPickIndex] = {
        ...profil,
        avatar,
      };
      setProfiles(noviProfili);
    }

    setAvatarModalVisible(false);
    setAvatarPickIndex(null);
  };

  const udjiUIgru = (index: number) => {
    router.push('./kategorije');
  };

  const kliknutoNaProfil = (index: number) => {
    const profil = profiles[index];

    if (!profil) {
      // Nema naloga na ovom mestu -> kreiranje novog naloga
      router.push('/signup');
      return;
    }

    if (!profil.avatar) {
      // Nalog postoji, ali avatar nije izabran -> otvori izbor avatara
      otvoriIzborAvatara(index);
      return;
    }

    // Nalog postoji i avatar je izabran -> ulazak u igru (za sad ne radi ništa)
    udjiUIgru(index);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require('../../assets/images/back.png')} style={styles.backIcon} resizeMode="contain" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/')}>
        <Image source={require('../../assets/images/menu.png')} style={styles.menuIcon} resizeMode="contain" />
      </TouchableOpacity>

      <Image source={require('@/assets/images/bear.png')} style={styles.bearStyle} resizeMode="contain" />

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/signup')}>
        <Image source={require('../../assets/images/add.png')} style={styles.addIcon} resizeMode="contain" />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.pentagonContainer}>

          {/* Linije koje povezuju krugove u oblik petougla */}
          <Svg
            width={PENTAGON_SIZE}
            height={PENTAGON_SIZE}
            style={styles.pentagonSvg}
            pointerEvents="none"
          >
            {pentagonPoints.map((tacka, i) => {
              const sledeca = pentagonPoints[(i + 1) % pentagonPoints.length];
              return (
                <Line
                  key={i}
                  x1={tacka.x}
                  y1={tacka.y}
                  x2={sledeca.x}
                  y2={sledeca.y}
                  stroke="#F27C8D"
                  strokeWidth={3}
                />
              );
            })}
          </Svg>

          {pentagonPoints.map((tacka, index) => {
            const profil = profiles[index];

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.avatarCircle,
                  {
                    left: tacka.x - CIRCLE_SIZE / 2,
                    top: tacka.y - CIRCLE_SIZE / 2,
                  },
                ]}
                onPress={() => kliknutoNaProfil(index)}
              >
                {profil ? (
                  <>
                    {profil.avatar ? (
                      <Image source={profil.avatar} style={styles.avatarImage} resizeMode="contain" />
                    ) : (
                      <TouchableOpacity
                        style={styles.plusBadge}
                        onPress={() => otvoriIzborAvatara(index)}
                      >
                        <Text style={styles.plusBadgeText}>+</Text>
                      </TouchableOpacity>
                    )}

                    <Text style={[styles.profileName, { color: profil.color }]}>
                      {profil.name}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.plus}>+</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.createButton} onPress={() => router.push('/signup')}>
          <Text style={styles.createButtonText}>Kreiraj novi nalog</Text>
        </TouchableOpacity>
      </View>

      {/* Modal za izbor avatara */}
      <Modal
        visible={avatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Izaberi avatar</Text>

            <View style={styles.avatarOptionsRow}>
              {avatars.map((avatar, i) => (
                <TouchableOpacity key={i} onPress={() => izaberiAvatar(avatar)}>
                  <Image source={avatar} style={styles.avatarOptionImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setAvatarModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Zatvori</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#9ADFCD',
    padding: 24,
    paddingTop: 40,
  },

  menuButton: {
    top: -40,
    right: 50,
  },

  menuIcon: {
    height: 90,
    width: 150,
  },

  backButton: {
    top: 30,
    right: -270,
  },

  backIcon: {
    height: 50,
    width: 100,
  },

  addButton: {
    top: 215,
    right: -40,
    zIndex: 100,
  },

  addIcon: {
    height: 70,
    width: 60,
    position: 'absolute',
  },

  card: {
    flex: 1,
    backgroundColor: '#F2F58C',
    borderWidth: 15,
    borderColor: '#FCD0C5',
    padding: 20,
    marginTop: -230,
    justifyContent: 'center',
    marginBottom: 30,
  },

  pentagonContainer: {
    marginTop:-60,
    width: PENTAGON_SIZE,
    height: PENTAGON_SIZE,
    alignSelf: 'center',
    position: 'relative',
  },

  pentagonSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  avatarCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 6,
    borderColor: '#9ADFCD',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  plusBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F27C8D',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },

  plusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Baloo2_700Bold',
  },

  plus: {
    fontSize: 40,
    color: '#F27C8D',
    fontFamily: 'Baloo2_700Bold',
  },

  profileName: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },

  createButton: {
    backgroundColor: '#C2EFEC',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 70,
  },

  createButtonText: {
    fontFamily: 'Baloo2_700Bold',
    color: '#F27C8D',
    fontSize: 18,
    textShadowColor: '#b93148',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  bearStyle: {
    width: 150,
    height: 180,
    zIndex: 100,
    left: 210,
    bottom: -480,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#F2F58C',
    borderRadius: 20,
    borderWidth: 8,
    borderColor: '#FCD0C5',
    padding: 24,
    alignItems: 'center',
  },

  modalTitle: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    color: '#F27C8D',
    marginBottom: 16,
  },

  avatarOptionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },

  avatarOptionImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#9ADFCD',
  },

  modalCloseButton: {
    backgroundColor: '#C2EFEC',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },

  modalCloseButtonText: {
    fontFamily: 'Baloo2_700Bold',
    color: '#F27C8D',
  },

});
