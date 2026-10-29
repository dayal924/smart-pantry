import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { C, R, S } from '../theme';

export type AuthFieldFocus = 'name' | 'email' | 'password' | null;

export interface PantryAuthHeroProps {
  focusedField: AuthFieldFocus;
  isLoading?: boolean;
  hasError?: boolean;
}

export function PantryAuthHero({
  focusedField,
  isLoading = false,
  hasError = false,
}: PantryAuthHeroProps) {
  // --- Animation Values ---
  // Idle breathing / hover
  const floatAnim = useRef(new Animated.Value(0)).current;
  // Leaf sway
  const leafAnim = useRef(new Animated.Value(0)).current;
  // Radar / pulse ring expansion
  const pulseAnim = useRef(new Animated.Value(0)).current;
  // Laser scan line sweep
  const laserAnim = useRef(new Animated.Value(0)).current;
  // Pupils looking down
  const eyeTrackAnim = useRef(new Animated.Value(0)).current;
  // Cyber visor / privacy shield drop
  const visorAnim = useRef(new Animated.Value(0)).current;
  // Error shake
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // Ambient particle drift
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  // 1. Setup continuous looping animations
  useEffect(() => {
    // Gentle floating hover (up & down)
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Leaf sway
    const leafLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Pulsing aura ring
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Ambient floating particles
    const p1Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(particle1, {
          toValue: 1,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(particle1, {
          toValue: 0,
          duration: 3200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const p2Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(particle2, {
          toValue: 1,
          duration: 3900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(particle2, {
          toValue: 0,
          duration: 3900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const p3Loop = Animated.loop(
      Animated.sequence([
        Animated.timing(particle3, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(particle3, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    leafLoop.start();
    pulseLoop.start();
    p1Loop.start();
    p2Loop.start();
    p3Loop.start();

    return () => {
      floatLoop.stop();
      leafLoop.stop();
      pulseLoop.stop();
      p1Loop.stop();
      p2Loop.stop();
      p3Loop.stop();
    };
  }, [floatAnim, leafAnim, pulseAnim, particle1, particle2, particle3]);

  // 2. Laser scan animation (faster when loading)
  useEffect(() => {
    laserAnim.setValue(0);
    const duration = isLoading ? 700 : 2000;
    const laserLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    laserLoop.start();

    return () => laserLoop.stop();
  }, [laserAnim, isLoading]);

  // 3. React to field focus
  useEffect(() => {
    // When password focused, slide down the privacy visor!
    if (focusedField === 'password') {
      Animated.spring(visorAnim, {
        toValue: 1,
        tension: 110,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(visorAnim, {
        toValue: 0,
        tension: 110,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }

    // When email or name is focused, gaze downward
    if (focusedField === 'email' || focusedField === 'name') {
      Animated.spring(eyeTrackAnim, {
        toValue: 1,
        tension: 120,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(eyeTrackAnim, {
        toValue: 0,
        tension: 120,
        friction: 9,
        useNativeDriver: true,
      }).start();
    }
  }, [focusedField, visorAnim, eyeTrackAnim]);

  // 4. Trigger shake when error occurs
  useEffect(() => {
    if (hasError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [hasError, shakeAnim]);

  // --- Interpolations ---
  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  const leafRotate = leafAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.95, 1.25, 1.35],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.45, 0.2, 0],
  });

  const laserY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-42, 42],
  });

  const eyeY = eyeTrackAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3.5],
  });

  const visorY = visorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });

  const visorOpacity = visorAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.8, 1],
  });

  const p1Y = particle1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });
  const p2Y = particle2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const p3Y = particle3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  // Dynamic HUD status label and color
  const getHudInfo = () => {
    if (isLoading) {
      return {
        icon: 'flash' as const,
        text: 'AI Bio-Scan: Authenticating...',
        badgeBg: C.infoSoft,
        badgeBorder: C.info,
        textColor: C.info,
      };
    }
    if (hasError) {
      return {
        icon: 'alert-circle' as const,
        text: 'Credentials Mismatch · Try Again',
        badgeBg: C.dangerSoft,
        badgeBorder: C.danger,
        textColor: C.danger,
      };
    }
    if (focusedField === 'password') {
      return {
        icon: 'lock-closed' as const,
        text: 'Privacy Shield · Bio-Encrypted',
        badgeBg: '#EDE7F6',
        badgeBorder: '#7E57C2',
        textColor: '#5E35B1',
      };
    }
    if (focusedField === 'email') {
      return {
        icon: 'scan' as const,
        text: 'Analyzing User Account...',
        badgeBg: C.primarySoft,
        badgeBorder: C.primary,
        textColor: C.primaryDark,
      };
    }
    if (focusedField === 'name') {
      return {
        icon: 'person' as const,
        text: 'Welcome! Registering Chef...',
        badgeBg: C.primarySoft,
        badgeBorder: C.primary,
        textColor: C.primaryDark,
      };
    }
    return {
      icon: 'sparkles' as const,
      text: 'AI Vision · Hass Avocado · 98% Fresh',
      badgeBg: '#FFFFFF',
      badgeBorder: C.primaryMuted,
      textColor: C.primaryDark,
    };
  };

  const hud = getHudInfo();
  const reticleColor = hasError
    ? C.danger
    : focusedField === 'password'
    ? '#7E57C2'
    : C.primary;

  return (
    <View style={styles.root}>
      {/* --- Ambient Floating Produce & Particles --- */}
      <Animated.View
        style={[
          styles.ambientParticle,
          { top: 6, left: 18, transform: [{ translateY: p1Y }] },
        ]}
      >
        <Text style={{ fontSize: 18, opacity: 0.65 }}>🌱</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.ambientParticle,
          { top: 22, right: 18, transform: [{ translateY: p2Y }] },
        ]}
      >
        <Text style={{ fontSize: 16, opacity: 0.6 }}>✨</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.ambientParticle,
          { bottom: 48, left: 24, transform: [{ translateY: p3Y }] },
        ]}
      >
        <Text style={{ fontSize: 15, opacity: 0.55 }}>🍋</Text>
      </Animated.View>

      {/* --- Main Scanner Chamber (with Shake transform) --- */}
      <Animated.View
        style={[
          styles.chamberContainer,
          {
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        {/* Pulsing Emerald Aura Ring */}
        <Animated.View
          style={[
            styles.pulseAura,
            {
              borderColor: reticleColor,
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />

        {/* Outer Circular Freshness Track */}
        <View style={[styles.freshnessTrack, { borderColor: C.borderLight }]}>
          <Svg width={140} height={140} viewBox="0 0 140 140" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="freshnessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#81C784" />
                <Stop offset="100%" stopColor="#2E7D32" />
              </LinearGradient>
            </Defs>
            {/* 300-degree Freshness Arc */}
            <Circle
              cx={70}
              cy={70}
              r={64}
              stroke="url(#freshnessGrad)"
              strokeWidth={2.5}
              strokeDasharray="320 80"
              strokeLinecap="round"
              fill="transparent"
              rotation={-110}
              origin="70, 70"
            />
          </Svg>
        </View>

        {/* 4 Viewfinder Reticle Brackets (HUD Camera Bounding Box) */}
        <View style={[styles.bracket, styles.bracketTL, { borderColor: reticleColor }]} />
        <View style={[styles.bracket, styles.bracketTR, { borderColor: reticleColor }]} />
        <View style={[styles.bracket, styles.bracketBL, { borderColor: reticleColor }]} />
        <View style={[styles.bracket, styles.bracketBR, { borderColor: reticleColor }]} />

        {/* Moving Laser Scan Sweep Line */}
        <Animated.View
          style={[
            styles.laserBar,
            {
              backgroundColor: reticleColor,
              transform: [{ translateY: laserY }],
              shadowColor: reticleColor,
            },
          ]}
        >
          <View style={[styles.laserCore, { backgroundColor: '#FFFFFF' }]} />
        </Animated.View>

        {/* --- The Living Mascot: Avocado "Pantry Guardian" --- */}
        <Animated.View
          style={[
            styles.mascotWrapper,
            {
              transform: [{ translateY: floatY }],
            },
          ]}
        >
          {/* Top Sprout Leaf with Sway */}
          <Animated.View
            style={[
              styles.leafAnchor,
              {
                transform: [{ rotate: leafRotate }],
              },
            ]}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24">
              <Path
                d="M 6 22 C 6 12 12 4 22 2 C 22 12 16 22 6 22 Z"
                fill="#43A047"
              />
              <Path
                d="M 6 22 Q 13 13 22 2"
                stroke="#2E7D32"
                strokeWidth={1.5}
                fill="none"
              />
            </Svg>
          </Animated.View>

          {/* Avocado Body */}
          <Svg width={96} height={108} viewBox="0 0 100 115">
            <Defs>
              <LinearGradient id="peelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#2E7D32" />
                <Stop offset="100%" stopColor="#1B5E20" />
              </LinearGradient>
              <LinearGradient id="fleshGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#E8F5E9" />
                <Stop offset="70%" stopColor="#C8E6C9" />
                <Stop offset="100%" stopColor="#A5D6A7" />
              </LinearGradient>
              <LinearGradient id="seedGrad" x1="20%" y1="20%" x2="90%" y2="90%">
                <Stop offset="0%" stopColor="#A1887F" />
                <Stop offset="60%" stopColor="#6D4C41" />
                <Stop offset="100%" stopColor="#4E342E" />
              </LinearGradient>
            </Defs>

            {/* Dark green rind / peel */}
            <Path
              d="M 50 14 C 36 14 26 30 20 52 C 14 74 19 96 36 105 C 45 110 55 110 64 105 C 81 96 86 74 80 52 C 74 30 64 14 50 14 Z"
              fill="url(#peelGrad)"
            />

            {/* Light cream-lime inner flesh */}
            <Path
              d="M 50 20 C 39 20 31 34 26 53 C 21 72 25 91 40 98 C 46 101 54 101 60 98 C 75 91 79 72 74 53 C 69 34 61 20 50 20 Z"
              fill="url(#fleshGrad)"
            />

            {/* Seed belly in lower half */}
            <Circle cx={50} cy={76} r={17} fill="url(#seedGrad)" />
            {/* Seed specular shine */}
            <Circle cx={44} cy={71} r={3.2} fill="#D7CCC8" opacity={0.65} />

            {/* Rosy Cheeks */}
            <Circle cx={34} cy={54} r={4.5} fill="#FF8A80" opacity={0.45} />
            <Circle cx={66} cy={54} r={4.5} fill="#FF8A80" opacity={0.45} />

            {/* Friendly Smile */}
            <Path
              d="M 45 54 Q 50 59 55 54"
              stroke="#1B5E20"
              strokeWidth={2}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>

          {/* Animated Eyes (Tracks email typing or looks normal) */}
          <Animated.View
            style={[
              styles.eyesContainer,
              {
                transform: [{ translateY: eyeY }],
              },
            ]}
          >
            {/* Left Eye */}
            <View style={styles.eye}>
              <View style={styles.eyePupil} />
              <View style={styles.eyeGlint} />
            </View>

            {/* Right Eye */}
            <View style={styles.eye}>
              <View style={styles.eyePupil} />
              <View style={styles.eyeGlint} />
            </View>
          </Animated.View>

          {/* Cyber Visor / Privacy Shield (Slides down on Password focus) */}
          <Animated.View
            style={[
              styles.visorContainer,
              {
                transform: [{ translateY: visorY }],
                opacity: visorOpacity,
              },
            ]}
          >
            <View style={styles.visorBody}>
              {/* Neon Visor Glint / Reflection line */}
              <View style={styles.visorReflection} />
              <Ionicons
                name="lock-closed"
                size={11}
                color="#00E676"
                style={{ opacity: 0.9 }}
              />
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* --- Dynamic Holographic HUD Metric Tag --- */}
      <View
        style={[
          styles.hudBadge,
          {
            backgroundColor: hud.badgeBg,
            borderColor: hud.badgeBorder,
          },
          S.card,
        ]}
      >
        <Ionicons name={hud.icon} size={14} color={hud.textColor} />
        <Text style={[styles.hudText, { color: hud.textColor }]}>{hud.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    position: 'relative',
    width: '100%',
  },
  ambientParticle: {
    position: 'absolute',
    zIndex: 1,
  },
  chamberContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseAura: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
  },
  freshnessTrack: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Viewfinder corner brackets
  bracket: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderWidth: 2.5,
  },
  bracketTL: {
    top: 4,
    left: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
  },
  bracketTR: {
    top: 4,
    right: 4,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 6,
  },
  bracketBL: {
    bottom: 4,
    left: 4,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
  },
  bracketBR: {
    bottom: 4,
    right: 4,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 6,
  },
  laserBar: {
    position: 'absolute',
    width: 116,
    height: 2.5,
    borderRadius: 2,
    zIndex: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  laserCore: {
    width: 36,
    height: 1.2,
    borderRadius: 1,
    opacity: 0.9,
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -4,
  },
  leafAnchor: {
    position: 'absolute',
    top: -10,
    left: 48,
    zIndex: 4,
  },
  eyesContainer: {
    position: 'absolute',
    top: 42,
    flexDirection: 'row',
    gap: 18,
    zIndex: 5,
  },
  eye: {
    width: 8,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#1B1F1A',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  eyePupil: {
    width: 6,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0F1A0F',
  },
  eyeGlint: {
    position: 'absolute',
    top: 1.5,
    left: 1.5,
    width: 2.8,
    height: 2.8,
    borderRadius: 1.4,
    backgroundColor: '#FFFFFF',
  },
  visorContainer: {
    position: 'absolute',
    top: 36,
    zIndex: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visorBody: {
    width: 52,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#1E1E24',
    borderWidth: 1.5,
    borderColor: '#00E676',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00E676',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  visorReflection: {
    position: 'absolute',
    left: -10,
    top: 2,
    width: 20,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: [{ rotate: '-35deg' }],
  },
  hudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: R.full,
    borderWidth: 1,
    marginTop: 10,
  },
  hudText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
