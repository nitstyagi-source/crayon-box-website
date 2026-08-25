import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  RotateCw,
  Bookmark
} from 'lucide-react-native';
import { GlassCard } from '../../components/GlassCard';
import { useAppStore } from '../../store/useAppStore';

export const LibraryOpacScreen: React.FC = () => {
  const { renewBookLoan } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'issued' | 'catalog'>('issued');

  const [activeLoans, setActiveLoans] = useState([
    {
      id: 'LN-001',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      accessionNo: 'ACC-2026-0042',
      issuedDate: '10 Aug 2026',
      dueDate: '24 Aug 2026',
      daysLeft: 2,
      status: 'Due Soon'
    },
    {
      id: 'LN-002',
      title: 'Wings of Fire',
      author: 'Dr. A.P.J. Abdul Kalam',
      accessionNo: 'ACC-2026-0118',
      issuedDate: '12 Aug 2026',
      dueDate: '26 Aug 2026',
      daysLeft: 4,
      status: 'Active'
    }
  ]);

  const catalogBooks = [
    { id: '1', title: 'The Discovery of India', author: 'Jawaharlal Nehru', category: 'History', copies: 3 },
    { id: '2', title: 'Concepts of Physics (Vol 1)', author: 'Dr. H.C. Verma', category: 'Science', copies: 5 },
    { id: '3', title: 'Introduction to Algorithms', author: 'Cormen, Leiserson', category: 'Computer Science', copies: 2 },
    { id: '4', title: 'Malgudi Days', author: 'R.K. Narayan', category: 'Literature', copies: 4 }
  ];

  const handleRenew = async (loanId: string, bookTitle: string) => {
    await renewBookLoan(loanId);
    Alert.alert('✓ Loan Renewed', `"${bookTitle}" has been extended for +7 days with zero overdue penalty.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Header Banner */}
      <GlassCard variant="glow" style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTag}>CIRCULATION DESK</Text>
            <Text style={styles.headerTitle}>Digital Library OPAC</Text>
          </View>
          <View style={styles.bookIconWrap}>
            <BookOpen size={24} color="#818CF8" />
          </View>
        </View>
      </GlassCard>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('issued')}
          style={[styles.tabButton, activeTab === 'issued' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === 'issued' && styles.activeTabText]}>
            My Borrowed Books (2)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('catalog')}
          style={[styles.tabButton, activeTab === 'catalog' && styles.activeTabButton]}
        >
          <Text style={[styles.tabText, activeTab === 'catalog' && styles.activeTabText]}>
            OPAC Catalog
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={16} color="#94A3B8" />
        <TextInput
          placeholder="Search by Title, Author, ISBN..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Tab Content */}
      {activeTab === 'issued' ? (
        <View style={styles.cardsList}>
          {activeLoans.map((loan) => (
            <GlassCard key={loan.id} style={styles.loanCard}>
              <View style={styles.loanHeader}>
                <View style={styles.loanLeft}>
                  <Bookmark size={18} color="#818CF8" />
                  <Text style={styles.loanTitle}>{loan.title}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: loan.daysLeft <= 2 ? '#EF444420' : '#10B98120' }]}>
                  <Text style={[styles.statusText, { color: loan.daysLeft <= 2 ? '#EF4444' : '#10B981' }]}>
                    {loan.daysLeft <= 2 ? 'DUE SOON' : 'ACTIVE'}
                  </Text>
                </View>
              </View>

              <Text style={styles.authorText}>Author: {loan.author}</Text>
              <Text style={styles.accText}>Accession No: {loan.accessionNo}</Text>

              <View style={styles.datesRow}>
                <Text style={styles.dateLabel}>Issued: {loan.issuedDate}</Text>
                <Text style={styles.dateDue}>Due: {loan.dueDate}</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleRenew(loan.id, loan.title)}
                style={styles.renewButton}
              >
                <RotateCw size={14} color="#FFFFFF" />
                <Text style={styles.renewButtonText}>1-Click Renew (+7 Days)</Text>
              </TouchableOpacity>
            </GlassCard>
          ))}
        </View>
      ) : (
        <View style={styles.cardsList}>
          {catalogBooks
            .filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.author.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((b) => (
              <GlassCard key={b.id} style={styles.catalogCard}>
                <View>
                  <Text style={styles.catalogTitle}>{b.title}</Text>
                  <Text style={styles.authorText}>Author: {b.author} • {b.category}</Text>
                </View>
                <View style={styles.copiesBadge}>
                  <Text style={styles.copiesText}>{b.copies} Available</Text>
                </View>
              </GlassCard>
            ))}
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  headerCard: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  bookIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardsList: {
    gap: 12,
  },
  loanCard: {
    padding: 16,
    gap: 8,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  loanTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  authorText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  accText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  dateLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  dateDue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F87171',
  },
  renewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  renewButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  catalogCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  catalogTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  copiesBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  copiesText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
});
