import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Platform
} from 'react-native';
import { TrendingUp, Dumbbell, UserCircle } from 'lucide-react-native';
import { BlurView } from '@react-native-community/blur'; // Fallback to translucent view if not available
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

export function CustomBottomTabBar({ state, descriptors, navigation }: any) {
  const navItems = [
    { label: 'Insights', icon: TrendingUp, path: 'Insights' },
    { label: 'Training', icon: Dumbbell, path: 'Training' },
    { label: 'Profile', icon: UserCircle, path: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = navItems.find(item => item.path === route.name)?.icon || Dumbbell;

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              activeOpacity={0.8}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive
              ]}
            >
              <Icon 
                size={20} 
                color={isFocused ? '#FFFFFF' : '#6B7280'} 
                strokeWidth={isFocused ? 2.5 : 2}
              />
              {isFocused && (
                <Text style={styles.tabLabel}>
                  {route.name}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A', // Very dark navy
    borderRadius: 40,
    padding: 8,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    gap: 8,
  },
  tabItemActive: {
    backgroundColor: '#8B5CF6', // Vibrant Purple
  },
  tabLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-condensed', // Simulating the bold italic look
  }
});
