import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native'
import React, { useMemo } from "react";
import { AppLayout } from "../components/AppLayout";
import { useDocuments } from "../hooks/useDocuments";
import { useFamily } from "../hooks/useFamily";
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DocumentLogo } from "../components/DocumentLogo";

const NotificationsPage = () => {
  const { documents, loading } = useDocuments();
  const { members } = useFamily();
  const navigation = useNavigation<any>();

  const alerts = useMemo(() => {
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);

    return documents
      .filter(doc => {
        if (!doc.expiry_date) return false;
        const expiry = new Date(doc.expiry_date);
        return expiry >= now && expiry <= oneWeekFromNow;
      })
      .map(doc => ({
        ...doc,
        ownerName: doc.family_member_id 
          ? members.find(m => m.id === doc.family_member_id)?.name ?? "Family"
          : "You",
        daysLeft: Math.ceil((new Date(doc.expiry_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [documents, members]);

  return (
    <AppLayout>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <Text style={styles.subtitle}>Stay updated on your document status</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {alerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.bellIconBg}>
              <Feather name="bell-off" size={40} color="#64748B" />
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyText}>No documents are expiring within the next 7 days.</Text>
          </View>
        ) : (
          alerts.map(alert => (
            <TouchableOpacity 
              key={alert.id} 
              style={styles.alertCard}
              onPress={() => navigation.navigate("Documents", { search: alert.name })}
            >
              <View style={styles.alertHeader}>
                <View style={styles.iconContainer}>
                  <Feather name="alert-circle" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.expiryTag}>Expiring in {alert.daysLeft} days</Text>
              </View>
              
              <View style={styles.docRow}>
                <DocumentLogo name={alert.name} category={alert.category} source={alert.source} size={32} />
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{alert.name}</Text>
                  <Text style={styles.docMeta}>{alert.category} • {alert.ownerName}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Text style={styles.dateText}>Expires on: {alert.expiry_date}</Text>
                <Text style={styles.viewText}>View Details →</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  list: {
    gap: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bellIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  expiryTag: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  docInfo: {
    marginLeft: 12,
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  docMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
  },
  viewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3b82f6',
  },
});

export default NotificationsPage;
