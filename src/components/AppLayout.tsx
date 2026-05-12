import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, SafeAreaView } from 'react-native'
import React, { ReactNode, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useDocuments } from "../hooks/useDocuments";
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { NotificationsSheet } from "./NotificationsSheet";
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
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationsCount = documents.filter((d) => d.status === "expired" || d.status === "soon").length;

  return (
    <SafeAreaView style={styles.container}>
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
            onPress={() => setShowNotifications(true)}
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
        {children}
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

      <NotificationsSheet 
        documents={documents}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    height: 56,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mainContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingBottom: 20,
  },
  navGrid: {
    flexDirection: 'row',
    height: 64,
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
