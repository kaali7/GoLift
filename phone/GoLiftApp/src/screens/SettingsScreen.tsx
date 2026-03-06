import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { 
  ChevronLeft, 
  User, 
  Bell, 
  Shield, 
  LogOut, 
  ChevronRight,
  HelpCircle,
  CreditCard,
  Info,
  Activity,
  Moon,
  Sun
} from 'lucide-react-native';
import { COLORS, SPACING } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';

export const SettingsScreen = () => {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout }
      ]
    );
  };

  const renderSettingItem = (
    icon: any, 
    title: string, 
    subtitle?: string, 
    action?: any, 
    isLast: boolean = false,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity 
      onPress={action} 
      activeOpacity={0.7} 
      style={[styles.settingItem, isLast && styles.lastItem]}
    >
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (typeof action === 'function' ? <ChevronRight size={18} color={COLORS.text.secondaryDark} /> : action)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.sectionCard}>
          {renderSettingItem(
            <User size={20} color={COLORS.primary} />,
            "Profile Information",
            user?.full_name || "Athlete",
            () => navigation.navigate('EditProfile')
          )}
          {renderSettingItem(
            <Activity size={20} color={COLORS.primary} />,
            "Body Metrics",
            "Weight, Fat %, Measurements",
            () => navigation.navigate('BodyMetrics')
          )}
          {renderSettingItem(
            <Shield size={20} color={COLORS.primary} />,
            "Security",
            "Change Password",
            () => navigation.navigate('ChangePassword'),
            true
          )}
        </Card>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card style={styles.sectionCard}>
          {renderSettingItem(
            <Bell size={20} color="#10B981" />,
            "Push Notifications",
            "Workout reminders",
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#374151', true: COLORS.primaryTransparent }}
              thumbColor={notificationsEnabled ? COLORS.primary : '#9CA3AF'}
            />
          )}
          {renderSettingItem(
            <Shield size={20} color="#10B981" />,
            "Biometric Login",
            "FaceID or TouchID",
            <Switch 
              value={biometricEnabled} 
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#374151', true: COLORS.primaryTransparent }}
              thumbColor={biometricEnabled ? COLORS.primary : '#9CA3AF'}
            />
          )}
          {renderSettingItem(
            isDarkMode ? <Moon size={20} color={COLORS.primary} /> : <Sun size={20} color={COLORS.primary} />,
            "Theme Mode",
            isDarkMode ? "Dark theme active" : "Light theme active",
            () => setIsDarkMode(!isDarkMode),
            true,
            <Switch 
              value={isDarkMode} 
              onValueChange={setIsDarkMode}
              trackColor={{ false: '#374151', true: COLORS.primaryTransparent }}
              thumbColor={isDarkMode ? COLORS.primary : '#9CA3AF'}
            />
          )}
        </Card>

        <Text style={styles.sectionTitle}>Support</Text>
        <Card style={styles.sectionCard}>
          {renderSettingItem(
            <HelpCircle size={20} color="#3B82F6" />,
            "Help Center",
            "FAQs and Support",
            () => {}
          )}
          {renderSettingItem(
            <Info size={20} color="#3B82F6" />,
            "About GoLift",
            "Version 1.0.0",
            () => {},
            true
          )}
        </Card>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color={COLORS.destructive} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: '#FFFFFF',
    fontSize: 24,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.text.secondaryDark,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 24,
    fontStyle: 'italic',
  },
  sectionCard: {
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondaryDark,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 40,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  logoutText: {
    color: COLORS.destructive,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
