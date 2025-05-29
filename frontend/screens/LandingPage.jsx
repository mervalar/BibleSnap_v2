import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,Image } from 'react-native';
const LandingPage = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.appIcon}>
        <Image
          source={require('../assets/Biblesnap.png')}
          style={{ width: 100, height: 100, borderRadius: 30 }}
          resizeMode="contain"
        />
       </View>
        
        {/* App Title */}
        <Text style={styles.appTitle}>BibleSnap</Text>
        <Text style={styles.appSubtitle}>Your Daily Scripture Companion</Text>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.welcomeTitle}>Welcome to BibleSnap!</Text>
        <Text style={styles.welcomeText}>
          Your journey to deeper biblical understanding and spiritual growth starts here.
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
            </View>
            <Text style={styles.featureTitle}>Bible Study</Text>
            <Text style={styles.featureDescription}>Read, listen, and explore Scripture daily</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* <DollarSign className="w-6 h-6 text-white" /> */}
            </View>
            <Text style={styles.featureTitle}>Prayer Tools</Text>
            <Text style={styles.featureDescription}>Track prayers and set reminders</Text>
          </View>

          {/* Journal */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* <Edit3 className="w-6 h-6 text-white" /> */}
            </View>
            <Text style={styles.featureTitle}>Journal</Text>
            <Text style={styles.featureDescription}>Document your spiritual journey</Text>
          </View>

          {/* AI Assistant */}
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              {/* <Crown className="w-6 h-6 text-white" /> */}
            </View>
            <Text style={styles.featureTitle}>AI Assistant</Text>
            <Text style={styles.featureDescription}>Get instant biblical insights</Text>
          </View>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          {/* <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </View> */}
          <View style={styles.reviewTextContainer}>
            <Text style={styles.reviewAuthor}>Changed my daily routine!</Text>
            <Text style={styles.reviewText}>
              "This app has transformed how I connect with Scripture. The daily reminders and journal features keep me accountable."
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Terms */}
      <Text style={styles.termsText}>
        By continuing, you agree to our{' '}
        <Text style={styles.linkText}>Terms of Service</Text> &{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    marginBottom: 24,
  },
  statusTime: { fontSize: 16, fontWeight: '500', color: '#333' },
  statusIcons: { flexDirection: 'row', alignItems: 'center' },
  signalContainer: { flexDirection: 'row', marginRight: 12 },
  signalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    marginRight: 4,
  },
  batteryContainer: {
    width: 24,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryLevel: {
    width: '80%',
    height: '80%',
    backgroundColor: '#333',
    borderRadius: 6,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  appIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  appTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  appSubtitle: { fontSize: 16, color: '#666' },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  welcomeText: { fontSize: 16, color: '#666', marginBottom: 24 },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#9333ea',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 4 },
  featureDescription: { fontSize: 14, color: '#666' },
  reviewSection: { marginBottom: 24 },
  ratingContainer: { flexDirection: 'row', marginBottom: 8 },
  reviewTextContainer: {},
  reviewAuthor: { fontSize: 16, fontWeight: '500', color: '#333' },
  reviewText: { fontSize: 14, color: '#666', marginTop: 4 },
  buttonContainer: { marginTop: 24 },
  primaryButton: {
    backgroundColor: '#9333ea',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  secondaryButtonText: {
    color: '#9333ea',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 18,
  },
  termsText: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});

export default LandingPage;