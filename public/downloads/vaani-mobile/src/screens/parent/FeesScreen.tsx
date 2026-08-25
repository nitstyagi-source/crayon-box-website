import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import {
  CreditCard,
  CheckCircle,
  Download,
  Receipt,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { GlassCard } from '../../components/GlassCard';
import { ModernButton } from '../../components/ModernButton';
import { useAppStore } from '../../store/useAppStore';

export const FeesScreen: React.FC = () => {
  const { invoices, payInvoice } = useAppStore();
  const [payingInvoiceNo, setPayingInvoiceNo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const totalDues = invoices
    .filter(inv => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handlePayNow = async (invoiceNo: string) => {
    setPayingInvoiceNo(invoiceNo);
    setIsProcessing(true);

    // Simulate instant Razorpay flow and ERP synchronization
    setTimeout(async () => {
      await payInvoice(invoiceNo);
      setIsProcessing(false);
      setSuccessModalVisible(true);
    }, 1200);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Total Dues Summary Header */}
      <View style={styles.section}>
        <GlassCard highlight style={styles.summaryCard}>
          <Text style={[Typography.caption, { color: Colors.primaryLight }]}>
            OUTSTANDING FEE BALANCE
          </Text>
          <Text style={[Typography.hero, styles.heroAmount]}>
            ₹{totalDues.toLocaleString()}
          </Text>
          <View style={styles.secureRow}>
            <ShieldCheck size={14} color={Colors.success} />
            <Text style={styles.secureText}>
              256-Bit Bank Grade SSL Encrypted Checkout
            </Text>
          </View>
        </GlassCard>
      </View>

      {/* Invoice List */}
      <View style={[styles.section, { marginBottom: 100 }]}>
        <Text style={[Typography.caption, styles.sectionTitle]}>FEE INVOICES & SCHEDULE</Text>

        {invoices.map(inv => {
          const isPaid = inv.status === 'PAID';
          return (
            <GlassCard
              key={inv.invoiceNo}
              style={styles.invoiceCard}
              accentBorderColor={isPaid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)'}
            >
              <View style={styles.invoiceHeader}>
                <View>
                  <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>{inv.term}</Text>
                  <Text style={styles.invoiceNo}>{inv.invoiceNo}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: isPaid
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'rgba(245, 158, 11, 0.15)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: isPaid ? Colors.success : Colors.warning },
                    ]}
                  >
                    {inv.status}
                  </Text>
                </View>
              </View>

              {/* Fee Breakdown */}
              <View style={styles.breakdownBox}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Tuition & Academic</Text>
                  <Text style={styles.breakdownVal}>₹{inv.breakdown.tuition.toLocaleString()}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>AC Bus Transport</Text>
                  <Text style={styles.breakdownVal}>₹{inv.breakdown.transport.toLocaleString()}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>STEAM Lab & Robotics</Text>
                  <Text style={styles.breakdownVal}>₹{inv.breakdown.lab.toLocaleString()}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Sports & Swimming</Text>
                  <Text style={styles.breakdownVal}>₹{inv.breakdown.sports.toLocaleString()}</Text>
                </View>
                <View style={[styles.breakdownRow, styles.totalRow]}>
                  <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>Total Fee</Text>
                  <Text style={[Typography.bodyBold, { color: '#FFFFFF' }]}>
                    ₹{inv.amount.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Action Button */}
              {isPaid ? (
                <View style={styles.paidFooter}>
                  <Text style={styles.paidDate}>Paid on {inv.paidOn}</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => Alert.alert('Receipt Downloaded', `Saved receipt for ${inv.invoiceNo} to files.`)}
                    style={styles.downloadBtn}
                  >
                    <Download size={14} color={Colors.primaryLight} />
                    <Text style={styles.downloadText}>Receipt PDF</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ModernButton
                  title={isProcessing && payingInvoiceNo === inv.invoiceNo ? 'Processing Payment...' : `Pay ₹${inv.amount.toLocaleString()} via Razorpay`}
                  loading={isProcessing && payingInvoiceNo === inv.invoiceNo}
                  onPress={() => handlePayNow(inv.invoiceNo)}
                  style={{ marginTop: 12 }}
                />
              )}
            </GlassCard>
          );
        })}
      </View>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalContent}>
            <View style={styles.successIconBox}>
              <CheckCircle size={48} color={Colors.success} />
            </View>
            <Text style={[Typography.h2, { color: '#FFFFFF', textAlign: 'center', marginTop: 14 }]}>
              Payment Successful!
            </Text>
            <Text style={[Typography.subtext, { textAlign: 'center', marginTop: 6 }]}>
              Your payment has been processed and automatically synchronized with the central School ERP ledger.
            </Text>
            <ModernButton
              title="Download Official Receipt"
              variant="outline"
              onPress={() => setSuccessModalVisible(false)}
              style={{ marginTop: 20 }}
            />
            <ModernButton
              title="Done"
              onPress={() => setSuccessModalVisible(false)}
              style={{ marginTop: 10 }}
            />
          </GlassCard>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  sectionTitle: {
    color: '#64748B',
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  summaryCard: {
    padding: 22,
    alignItems: 'center',
  },
  heroAmount: {
    marginVertical: 8,
    color: '#FFFFFF',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '600',
  },
  invoiceCard: {
    marginBottom: 14,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceNo: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  breakdownBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  breakdownVal: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 6,
    paddingTop: 8,
  },
  paidFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
  },
  paidDate: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  downloadText: {
    color: Colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
