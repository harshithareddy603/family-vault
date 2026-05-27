/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import React from 'react';
import { AppLayout } from '../components/AppLayout';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDocuments } from '../hooks/useDocuments';

// ─── Stat Card Component ─────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  isFeather?: boolean;
}

const StatCard = ({
  label,
  value,
  subtext,
  iconName,
  iconBg,
  iconColor,
  isFeather = false,
}: StatCardProps) => (
  <View style={s.card}>
    <View style={s.cardHeader}>
      <View style={[s.iconBox, { backgroundColor: iconBg }]}>
        {isFeather ? (
          <Feather name={iconName as any} size={18} color={iconColor} />
        ) : (
          <MaterialCommunityIcons name={iconName as any} size={20} color={iconColor} />
        )}
      </View>
    </View>
    <Text style={s.cardLabel}>{label}</Text>
    <Text style={s.cardValue}>{value}</Text>
    <Text style={s.cardSubtext}>{subtext}</Text>
  </View>
);

// ─── Main Analytics Page ─────────────────────────────────────────────────────

const Analytics = () => {
  const { documents } = useDocuments();
  const isWeb = Platform.OS === 'web';

  // Calculate dynamic stats or fall back to high-fidelity mock from Figma
  const docCount = documents.length;
  const displayUploads = docCount > 0 ? docCount : 68;
  const displayViews = docCount > 0 ? docCount * 3 + 12 : 156;

  // Chart data
  const trendData = [
    { month: 'Dec', value: 8 },
    { month: 'Jan', value: 15 },
    { month: 'Feb', value: 12 },
    { month: 'Mar', value: 20 },
    { month: 'Apr', value: 18 },
    { month: 'May', value: 25 },
  ];

  const maxVal = Math.max(...trendData.map((d) => d.value));

  return (
    <AppLayout>
      <View style={s.header}>
        <Text style={s.pageTitle}>Usage Analytics</Text>
      </View>

      {/* Grid of stats */}
      <View style={s.statsGrid}>
        <StatCard
          label="Total Uploads"
          value={displayUploads}
          subtext="+12 this month"
          iconName="upload"
          iconBg="#EFF6FF"
          iconColor="#3B82F6"
          isFeather
        />
        <StatCard
          label="Document Views"
          value={displayViews}
          subtext="+23 this week"
          iconName="eye"
          iconBg="#ECFDF5"
          iconColor="#10B981"
          isFeather
        />
        <StatCard
          label="Active Categories"
          value="7"
          subtext="Covering all aspects"
          iconName="chart-bar"
          iconBg="#F5F3FF"
          iconColor="#8B5CF6"
        />
        <StatCard
          label="Growth Rate"
          value="+18%"
          subtext="vs last month"
          iconName="trending-up"
          iconBg="#FFF7ED"
          iconColor="#F97316"
          isFeather
        />
      </View>

      {/* Trend chart widget */}
      <View style={s.chartCard}>
        <Text style={s.chartTitle}>Upload Trends (Last 6 Months)</Text>

        <View style={s.chartWrapper}>
          {/* Y Axis Gridlines and Labels */}
          <View style={s.chartBody}>
            <View style={s.gridLinesContainer}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={s.gridLine} />
              ))}
            </View>

            {/* Bars container */}
            <View style={s.barsContainer}>
              {trendData.map((d, index) => {
                const heightPercent = (d.value / maxVal) * 85; // cap height at 85% for layout breathing room
                return (
                  <View key={index} style={s.barColumn}>
                    <View style={s.barWrapper}>
                      <View
                        style={[
                          s.barFill,
                          {
                            height: `${heightPercent}%`,
                            backgroundColor: index === trendData.length - 1 ? '#3B82F6' : '#93C5FD',
                          },
                        ]}
                      />
                      <Text style={s.barValue}>{d.value}</Text>
                    </View>
                    <Text style={s.barLabel}>{d.month}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </AppLayout>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 200 : '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardSubtext: {
    fontSize: 11.5,
    color: '#10B981',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 24,
  },
  chartWrapper: {
    height: 240,
    paddingTop: 10,
  },
  chartBody: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  gridLinesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 30, // leave space for labels
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    zIndex: 2,
  },
  barColumn: {
    alignItems: 'center',
    width: '12%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  barFill: {
    width: '100%',
    maxWidth: 24,
    borderRadius: 4,
  },
  barValue: {
    position: 'absolute',
    top: -20,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 10,
    height: 20,
  },
});

export default Analytics;
