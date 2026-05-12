import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, Modal, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { useFamily } from "../hooks/useFamily";
import { useDocuments } from "../hooks/useDocuments";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';

const RELATIONS = ["Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"];

const Family = () => {
  const { members, addMember, updateMember, deleteMember } = useFamily();
  const { documents } = useDocuments();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const reset = () => { setName(""); setEditingId(null); setTermsAccepted(false); };

  const submit = async () => {
    if (!termsAccepted) {
      Alert.alert("Error", "Please accept the terms to continue.");
      return;
    }
    const payload = { name };
    const { error } = editingId
      ? await updateMember(editingId, payload)
      : await addMember(payload);
    if (error) Alert.alert("Error", error.message);
    else { 
      Alert.alert("Success", editingId ? "Member updated" : "Member added"); 
      setOpen(false); 
      reset(); 
    }
  };

  const startEdit = (id: string) => {
    const m = members.find((x) => x.id === id);
    if (!m) return;
    setEditingId(id); setName(m.name);
    setTermsAccepted(true);
    setOpen(true);
  };

  return (
    <AppLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Family Doc's</Text>
          <Text style={styles.subtitle}>Manage your loved ones.</Text>
        </View>

        {members.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="users" size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No family members yet.</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add one.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {members.map((m) => {
              const docs = documents.filter((d) => d.family_member_id === m.id);
              const alerts = docs.filter((d) => d.status !== "safe").length;
              return (
                <View key={m.id} style={styles.card}>
                  <View style={styles.cardRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName} numberOfLines={1}>{m.name}</Text>
                      <View style={styles.memberStats}>
                        <Text style={styles.statsText}>{docs.length} docs</Text>
                        {alerts > 0 && (
                          <Text style={styles.alertText}>{alerts} alert{alerts > 1 ? "s" : ""}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.actionColumn}>
                      <TouchableOpacity style={styles.iconButton} onPress={() => startEdit(m.id)}>
                        <Feather name="edit-2" size={16} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.iconButton} 
                        onPress={() => {
                          Alert.alert(
                            "Remove Member",
                            "Are you sure?",
                            [
                              { text: "Cancel", style: "cancel" },
                              { text: "Remove", style: "destructive", onPress: () => deleteMember(m.id) }
                            ]
                          );
                        }}
                      >
                        <Feather name="trash-2" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.viewDetailsBtn} onPress={() => setViewingId(m.id)}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <Feather name="chevron-right" size={14} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)}>
        <Feather name="plus" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={open} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId ? "Edit Member" : "Add Family Member"}</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput 
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
              />
            </View>
            <View style={styles.termsContainer}>
              <Checkbox.Android
                status={termsAccepted ? 'checked' : 'unchecked'}
                onPress={() => setTermsAccepted(!termsAccepted)}
                color="#3b82f6"
              />
              <Text style={styles.termsText}>
                Please try to save correct details for accessing the files easily.
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, !termsAccepted && styles.disabledButton]} 
              onPress={submit}
              disabled={!termsAccepted}
            >
              <Text style={styles.saveButtonText}>{editingId ? "Save Changes" : "Add Member"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => { setOpen(false); reset(); }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* View Details Modal */}
      <Modal visible={!!viewingId} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {(() => {
              const m = members.find(x => x.id === viewingId);
              const mDocs = documents.filter(d => d.family_member_id === viewingId);
              return (
                <View>
                  <Text style={styles.modalTitle}>{m?.name}'s Details</Text>
                  <ScrollView style={styles.detailsList}>
                    <Text style={styles.detailsSectionTitle}>Documents ({mDocs.length})</Text>
                    {mDocs.length === 0 ? (
                      <View style={styles.emptyDocs}>
                        <Text style={styles.emptyDocsText}>No documents added yet.</Text>
                      </View>
                    ) : (
                      mDocs.map(d => (
                        <View key={d.id} style={styles.docItem}>
                          <View style={styles.docIcon}>
                            <Feather name="file-text" size={16} color="#3b82f6" />
                          </View>
                          <View style={styles.docContent}>
                            <Text style={styles.docName} numberOfLines={1}>{d.name}</Text>
                            <Text style={styles.docCategory}>{d.category}</Text>
                          </View>
                        </View>
                      ))
                    )}
                  </ScrollView>
                  <TouchableOpacity style={styles.closeBtn} onPress={() => setViewingId(null)}>
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  memberStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 12,
  },
  alertText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  actionColumn: {
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '600',
    marginRight: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingRight: 24,
  },
  termsText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
    lineHeight: 18,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
  },
  disabledButton: {
    opacity: 0.5,
  },
  detailsList: {
    maxHeight: 400,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  emptyDocs: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  emptyDocsText: {
    fontSize: 12,
    color: '#64748B',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 8,
  },
  docIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docContent: {
    flex: 1,
    marginLeft: 12,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  docCategory: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    marginTop: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  closeBtnText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default Family;
