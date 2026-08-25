import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Home,
  Video,
  Navigation as NavIcon,
  CreditCard,
  BookOpen,
  User,
  Bell,
  CheckSquare,
  Users,
  Clock,
  Award,
  Radio,
  Bookmark,
  QrCode
} from 'lucide-react-native';

import { Colors } from '../theme/colors';
import { HeaderBar } from '../components/HeaderBar';
import { useAppStore } from '../store/useAppStore';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ParentDashboardScreen } from '../screens/parent/ParentDashboardScreen';
import { LiveCctvScreen } from '../screens/parent/LiveCctvScreen';
import { BusTrackerScreen } from '../screens/parent/BusTrackerScreen';
import { FeesScreen } from '../screens/parent/FeesScreen';
import { DigitalDiaryScreen } from '../screens/parent/DigitalDiaryScreen';
import { ReportCardScreen } from '../screens/parent/ReportCardScreen';

import { FacultyDashboardScreen } from '../screens/faculty/FacultyDashboardScreen';
import { AttendanceRegisterScreen } from '../screens/faculty/AttendanceRegisterScreen';
import { HomeworkPublisherScreen } from '../screens/faculty/HomeworkPublisherScreen';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ApprovalsScreen } from '../screens/admin/ApprovalsScreen';

import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { TimetableScreen } from '../screens/student/TimetableScreen';
import { LibraryOpacScreen } from '../screens/student/LibraryOpacScreen';

import { DriverCockpitScreen } from '../screens/driver/DriverCockpitScreen';
import { DigitalIdCardScreen } from '../screens/common/DigitalIdCardScreen';

import { NotificationsScreen } from '../screens/common/NotificationsScreen';
import { ProfileScreen } from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator<any>();
const Stack = createNativeStackNavigator<any>();

const ScreenWithHeader = ({ Component, navigation }: { Component: React.ComponentType<any>; navigation: any }) => (
  <View style={styles.screenContainer}>
    <HeaderBar onNotificationPress={() => navigation.navigate('Notifications')} />
    <Component navigation={navigation} />
  </View>
);

// 1. PARENT TABS
const ParentTabs = ({ navigation }: { navigation: any }) => (
  <Tab.Navigator
    id="parent-tabs"
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#818CF8',
      tabBarInactiveTintColor: '#64748B',
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="ParentHome"
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={ParentDashboardScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="LiveCctvTab"
      options={{
        tabBarLabel: '16 CCTV',
        tabBarIcon: ({ color, size }) => <Video size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={LiveCctvScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="BusTrackerTab"
      options={{
        tabBarLabel: 'Bus GPS',
        tabBarIcon: ({ color, size }) => <NavIcon size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={BusTrackerScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="FeesTab"
      options={{
        tabBarLabel: 'Fees',
        tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={FeesScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="IdCardTab"
      options={{
        tabBarLabel: 'ID Pass',
        tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={DigitalIdCardScreen} {...props} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// 2. FACULTY TABS
const FacultyTabs = ({ navigation }: { navigation: any }) => (
  <Tab.Navigator
    id="faculty-tabs"
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#06B6D4',
      tabBarInactiveTintColor: '#64748B',
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="FacultyHome"
      options={{
        tabBarLabel: 'Desk',
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={FacultyDashboardScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="AttendanceTab"
      options={{
        tabBarLabel: 'Attendance',
        tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={AttendanceRegisterScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="HomeworkTab"
      options={{
        tabBarLabel: 'Homework',
        tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={HomeworkPublisherScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="ProfileTab"
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={ProfileScreen} {...props} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// 3. ADMIN TABS
const AdminTabs = ({ navigation }: { navigation: any }) => (
  <Tab.Navigator
    id="admin-tabs"
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#F59E0B',
      tabBarInactiveTintColor: '#64748B',
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="AdminHome"
      options={{
        tabBarLabel: 'Executive',
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={AdminDashboardScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="ApprovalsTab"
      options={{
        tabBarLabel: 'Approvals',
        tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={ApprovalsScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="CctvTab"
      options={{
        tabBarLabel: '16 Cameras',
        tabBarIcon: ({ color, size }) => <Video size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={LiveCctvScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="ProfileTab"
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={ProfileScreen} {...props} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// 4. STUDENT TABS
const StudentTabs = ({ navigation }: { navigation: any }) => (
  <Tab.Navigator
    id="student-tabs"
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#EC4899',
      tabBarInactiveTintColor: '#64748B',
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="StudentHome"
      options={{
        tabBarLabel: 'Dashboard',
        tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={StudentDashboardScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="TimetableTab"
      options={{
        tabBarLabel: 'Timetable',
        tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={TimetableScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="LibraryTab"
      options={{
        tabBarLabel: 'Library',
        tabBarIcon: ({ color, size }) => <Bookmark size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={LibraryOpacScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="IdPassTab"
      options={{
        tabBarLabel: 'ID Pass',
        tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={DigitalIdCardScreen} {...props} />}
    </Tab.Screen>
  </Tab.Navigator>
);

// 5. DRIVER TABS
const DriverTabs = ({ navigation }: { navigation: any }) => (
  <Tab.Navigator
    id="driver-tabs"
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: '#10B981',
      tabBarInactiveTintColor: '#64748B',
      tabBarLabelStyle: styles.tabLabel,
    }}
  >
    <Tab.Screen
      name="DriverCockpitTab"
      options={{
        tabBarLabel: 'Cockpit',
        tabBarIcon: ({ color, size }) => <Radio size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={DriverCockpitScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="DriverBusMapTab"
      options={{
        tabBarLabel: 'Live GPS',
        tabBarIcon: ({ color, size }) => <NavIcon size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={BusTrackerScreen} {...props} />}
    </Tab.Screen>
    <Tab.Screen
      name="DriverProfileTab"
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
      }}
    >
      {props => <ScreenWithHeader Component={ProfileScreen} {...props} />}
    </Tab.Screen>
  </Tab.Navigator>
);

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, userRole } = useAppStore();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const getActiveTabFlow = () => {
    switch (userRole) {
      case 'Faculty':
        return FacultyTabs;
      case 'Admin':
        return AdminTabs;
      case 'Student':
        return StudentTabs;
      case 'Driver':
        return DriverTabs;
      default:
        return ParentTabs;
    }
  };

  return (
    <Stack.Navigator
      id="root-stack"
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={getActiveTabFlow()}
        options={{ headerShown: false }}
      />
      {/* Universal Stack Destinations */}
      <Stack.Screen
        name="LiveCctv"
        component={LiveCctvScreen}
        options={{ title: 'Classroom 16-CCTV Live Hub' }}
      />
      <Stack.Screen
        name="BusTracker"
        component={BusTrackerScreen}
        options={{ title: 'Live GPS Bus Tracker' }}
      />
      <Stack.Screen
        name="DriverCockpit"
        component={DriverCockpitScreen}
        options={{ title: 'Driver Telematics Cockpit' }}
      />
      <Stack.Screen
        name="Fees"
        component={FeesScreen}
        options={{ title: 'School Fee Invoices' }}
      />
      <Stack.Screen
        name="DigitalDiary"
        component={DigitalDiaryScreen}
        options={{ title: 'Digital Diary & Homework' }}
      />
      <Stack.Screen
        name="ReportCard"
        component={ReportCardScreen}
        options={{ title: 'Term Report Card & Grades' }}
      />
      <Stack.Screen
        name="AttendanceRegister"
        component={AttendanceRegisterScreen}
        options={{ title: 'Class Attendance Register' }}
      />
      <Stack.Screen
        name="HomeworkPublisher"
        component={HomeworkPublisherScreen}
        options={{ title: 'Publish New Homework' }}
      />
      <Stack.Screen
        name="Approvals"
        component={ApprovalsScreen}
        options={{ title: 'Executive Approvals Desk' }}
      />
      <Stack.Screen
        name="LibraryOpac"
        component={LibraryOpacScreen}
        options={{ title: 'Digital Library OPAC' }}
      />
      <Stack.Screen
        name="DigitalIdCard"
        component={DigitalIdCardScreen}
        options={{ title: 'Digital ID & Escort Pass' }}
      />
      <Stack.Screen
        name="Timetable"
        component={TimetableScreen}
        options={{ title: 'Master Period Schedule' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Announcements & Alerts' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile & Preferences' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  tabBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
});
