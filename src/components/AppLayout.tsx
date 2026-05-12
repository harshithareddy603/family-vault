import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, SafeAreaView, Platform } from 'react-native'
import React, { ReactNode, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useDocuments } from "../hooks/useDocuments";
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const links = [
  { to: "Dashboard", label: "Home", icon: "home-outline" as const },
  { to: "Documents", label: "Docs", icon: "file-document-outline" as const },
  { to: "Family", label: "Family", icon: "account-group-outline" as const },
  { to: "Profile", label: "Profile", icon: "account-outline" as const },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const { documents } = useDocuments();
  const navigation = useNavigation<any>();
  const route = useRoute();

  const notificationsCount = documents.filter((d) => {
    if (!d.expiry_date) return false;
    const days = Math.floor((new Date(d.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 7;
  }).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.responsiveWrapper}>
        {/* Compact mobile top bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("Dashboard")} style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#fff" />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>Smart Docs</Text>
              {user?.email && (
                <Text style={styles.logoSubtitle} numberOfLines={1}>{user.email}</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Feather name="bell" size={20} color="#374151" />
              {notificationsCount > 0 && (
                <View style={styles.notificationDot} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={async () => { await signOut(); navigation.navigate("Auth"); }}
            >
              <Feather name="log-out" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main content */}
        <ScrollView contentContainerStyle={styles.mainContent}>
          <View style={styles.contentWrapper}>
            {children}
          </View>
        </ScrollView>

        {/* Bottom tab navigation */}
        <View style={styles.bottomNav}>
          <View style={styles.navGrid}>
            {links.map((l) => {
              const isActive = route.name === l.to;
              return (
                <TouchableOpacity
                  key={l.to}
                  onPress={() => navigation.navigate(l.to)}
                  style={styles.navItem}
                >
                  <View style={[styles.navIconContainer, isActive && styles.navIconActive]}>
                    <MaterialCommunityIcons 
                      name={l.icon as any} 
                      size={20} 
                      color={isActive ? "#3b82f6" : "#6b7280"} 
                    />
                    {l.label === "Docs" && notificationsCount > 0 && (
                      <View style={styles.navBadge}>
                        <Text style={styles.navBadgeText}>
                          {notificationsCount > 9 ? '9+' : notificationsCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {l.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Slightly darker background for the "gutter" area
    alignItems: 'center',
  },
  responsiveWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F8FAFC', // App's actual background
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  logoSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mainContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra space for bottom nav
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    height: Platform.OS === 'ios' ? 84 : 74,
  },
  navGrid: {
    flexDirection: 'row',
    flex: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  navIconActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  navLabelActive: {
    color: '#3B82F6',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  navBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
