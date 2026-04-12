# RealChallenge
A "real-life challenge" mobile app created with Expo and React Native.

Sovellus tarjoaa käyttäjälle päivittäisiä “real-life” -haasteita, jotka suoritetaan fyysisessä ympäristössä. Haasteet voivat liittyä esimerkiksi liikkumiseen, ympäristön havainnointiin tai yksinkertaisiin tehtäviin (esim. tietyn matkan kulkeminen, tietyn tyyppisen kohteen valokuvaaminen tai uuden paikan vieraileminen).

Käyttäjä voi:

vastaanottaa ja selata haasteita
suorittaa haasteita hyödyntämällä laitteen ominaisuuksia (sijainti, kamera)
saada automaattisen tarkistuksen haasteen suorittamisesta (esim. sijaintiin perustuen)
tallentaa suoritetut haasteet ja seurata omaa edistymistään

Sovellus sisältää useita näkymiä (esim. haasteet, aktiivinen haaste, historia) ja hyödyntää eriytettyjä komponentteja sekä sovelluslogiikkaa haasteiden generointiin ja validointiin.

Käytetyt teknologiat
React Native + Expo
Expo Router (navigointi näkymien välillä)
TypeScript (tyypitetty sovelluslogiikka)

Expo SDK -ominaisuudet:

expo-location (sijaintiin perustuvat haasteet)
expo-camera (kuvaan perustuvat haasteet)
expo-notifications (päivittäiset haasteet / muistutukset)

Datan hallinta:

AsyncStorage (paikallinen tallennus haasteille ja edistymiselle)

UI:

react-native-paper (käyttöliittymäkomponentit)

Sovellusarkkitehtuuri:

Custom React hookit (esim. haasteiden hallinta ja logiikka)
Context API (globaalin tilan hallinta, esim. käyttäjän edistyminen)
