import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Check, X, Clock, FileText, CheckCircle2, XCircle } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { useAppStore } from '../../store/useAppStore';

export const ApprovalsScreen: React.FC = () => {
  const { approvals, triageApprovalItem } = useAppStore();

  const handleTriage = async (id: string, action: 'APPROVE' | 'REJECT') => {
    await triageApprovalItem(id, action);
    Alert.alert(
      action === 'APPROVE' ? 'Request Approved' : 'Request Rejected',
      `Application ${id} status synchronized with ERP database.`
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[Typography.caption, styles.sectionTitle]}>
          EXECUTIVE TRIAGE QUEUE ({approvals.filter(a => a.status === 'PENDING').length} PENDING)
        </Text>

        {approvals.map(item => {
          const isPending = item.status === 'PENDING';
          const isApproved = item.status === 'APPROVED';
          const isRejected = item.status === 'REJECTED';

          return (
            <GlassCard
              key={item.id}
              style={styles.card}
              accentBorderColor={
                isApproved
                  ? 'rgba(16, 185, 129, 0.3)'
                  : isRejected
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(245, 158, 11, 0.4)'
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <FileText size={12} color={Colors.primaryLight} />
                  <Text style={styles.typeText}>{item.type}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>

              <Text style={[Typography.bodyBold, { color: '#FFFFFF', marginTop: 6 }]}>
                {item.requester}
              </Text>
              <Text style={[Typography.body, styles.detailsText]}>{item.details}</Text>

              {item.amount && (
                <View style={styles.amountBox}>
                  <Text style={styles.amountLabel}>Claim Amount: </Text>
                  <Text style={styles.amountVal}>{item.amount}</Text>
                </View>
              )}

              {/* Action Buttons or Resolution Status */}
              {isPending ? (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleTriage(item.id, 'REJECT')}
                    style={[styles.btn, styles.btnReject]}
                  >
                    <X size={16} color={Colors.danger} />
                    <Text style={[styles.btnText, { color: Colors.danger }]}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleTriage(item.id, 'APPROVE')}
                    style={[styles.btn, styles.btnApprove]}
                  >
                    <Check size={16} color="#FFFFFF" />
                    <Text style={[styles.btnText, { color: '#FFFFFF' }]}>Approve</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    styles.resolvedBox,
                    {
                      backgroundColor: isApproved
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    },
                  ]}
                >
                  {isApproved ? (
                    <CheckCircle2 size={16} color={Colors.success} />
                  ) : (
                    <XCircle size={16} color={Colors.danger} />
                  )}
                  <Text
                    style={[
                      styles.resolvedText,
                      { color: isApproved ? Colors.success : Colors.danger },
                    ]}
                  >
                    {item.status} & Logged to ERP
                  </Text>
                </View>
              )}
            </GlassCard>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    margin: 16,
    marginBottom: 100,
  },
  sectionTitle: {
    color: '#64748B',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  card: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 6,
  },
  typeText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  dateText: {
    color: '#64748B',
    fontSize: 11,
  },
  detailsText: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  amountLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  amountVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  btnApprove: {
    backgroundColor: Colors.primary,
  },
  btnReject: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  resolvedText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
