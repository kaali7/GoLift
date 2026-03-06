import { Platform } from 'react-native';

export const FONTS = {
  heading: 'SpaceGrotesk-Bold',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
};

export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONTS.heading,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  body: {
    fontFamily: FONTS.body,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  label: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: '#6B7280',
  },
};
