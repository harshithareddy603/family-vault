import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useMemo, useState } from "react";
import { DocumentPreviewSheet } from "../components/DocumentPreviewSheet";
import type { DocumentRow } from "../services/supabase";
import { AppLayout } from "../components/AppLayout";
import { useDocuments } from "../hooks/useDocuments";
import { useAuth } from "../hooks/useAuth";
import { DocumentLogo } from "../components/DocumentLogo";
import { useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-paper';

const Dashboard = () => {
  const { user } = useAuth();
  const { documents, loading } = useDocuments();
  const [previewDoc, setPreviewDoc] = useState<DocumentRow | null>(null);
  const navigation = useNavigation<any>();

  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => d.family_member_id === null);
  }, [documents]);

  const name = user?.user_metadata?.name || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <AppLayout>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Blue Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.userName}>{name}!</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <Avatar.Text size={48} label={name.charAt(0)} style={styles.avatarFallback} labelStyle={styles.avatarLabel} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            Smart Doc's stores the files as per the user uploades.
          </Text>
        </View>

        {/* Document List Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My documents</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#64748B" />
              <Text style={styles.loadingText}>Loading documents...</Text>
            </View>
          ) : filteredDocuments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No documents yet.</Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => navigation.navigate("Documents")}
              >
                <Text style={styles.ctaButtonText}>Add document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.list}>
              {filteredDocuments.slice(0, 5).map((d) => (
                <TouchableOpacity 
                  key={d.id} 
                  style={styles.listItem}
                  onPress={() => setPreviewDoc(d)}
                >
                  <View style={styles.logoContainer}>
                    <DocumentLogo name={d.name} category={d.category} source={d.source} size={32} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemName} numberOfLines={1}>{d.name}</Text>
                    <Text style={styles.itemCategory}>{d.category.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <DocumentPreviewSheet 
        document={previewDoc} 
        isOpen={!!previewDoc} 
        onClose={() => setPreviewDoc(null)} 
      />
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 0,
  },
  header: {
    backgroundColor: '#4a3aff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
    marginRight: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flexWrap: 'wrap',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarFallback: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarLabel: {
    color: '#4a3aff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: '#4a3aff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default Dashboard;
