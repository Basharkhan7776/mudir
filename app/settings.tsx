import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Stack, useRouter } from 'expo-router';
import {
  FileDown,
  FileUp,
  Moon,
  Sun,
  Globe,
  Database,
  ChevronRight,
  Store,
  Trash2,
  ArrowLeft,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import {
  updateOrganizationName,
  updateCurrency,
  setSettings,
} from '@/lib/store/slices/settingsSlice';
import { setCollections } from '@/lib/store/slices/inventorySlice';
import { setLedger } from '@/lib/store/slices/ledgerSlice';
import { exportData, importData } from '@/lib/utils/export-import';
import { Icon } from '@/components/ui/icon';
import { seedDatabase, clearDatabase, getSeedData } from '@/lib/seed';

const CURRENCIES = [
  { value: '₹', label: 'Indian Rupee (INR)' },
  { value: '$', label: 'US Dollar (USD)' },
  { value: '€', label: 'Euro (EUR)' },
  { value: '£', label: 'British Pound (GBP)' },
  { value: '¥', label: 'Japanese Yen (JPY)' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const inventory = useSelector((state: RootState) => state.inventory);
  const ledger = useSelector((state: RootState) => state.ledger);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleExport = async () => {
    console.log('[Settings] Starting export...');
    setIsExporting(true);
    try {
      const success = await exportData();
      console.log('[Settings] Export result:', success);
      if (success) {
        setSuccessMessage('Data exported successfully');
        setSuccessDialogOpen(true);
      }
    } catch (e) {
      console.error('[Settings] Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    console.log('importing');
    setIsImporting(true);
    const data = await importData();
    setIsImporting(false);

    if (data) {
      dispatch(setSettings(data.meta));
      dispatch(setCollections(data.collections));
      dispatch(setLedger(data.ledger));
      setSuccessMessage('Data imported successfully');
      setSuccessDialogOpen(true);
    }
  };

  const handleSeed = async () => {
    console.log('[Settings] Starting seed...');
    try {
      const success = await seedDatabase();
      console.log('[Settings] Seed result:', success);
      if (success) {
        // Import seedData directly/reuse to update redux to avoid reload requirement
        const data = getSeedData();
        console.log('[Settings] Dispatching seed data to Redux');
        dispatch(setSettings(data.meta));
        dispatch(setCollections(data.collections));
        dispatch(setLedger(data.ledger));
        setSuccessMessage('Database seeded successfully');
        setSuccessDialogOpen(true);
      } else {
        console.error('[Settings] Seed returned false');
      }
    } catch (e) {
      console.error('[Settings] Seed failed:', e);
    }
  };

  const handleClear = () => {
    Alert.alert('Clear Database', 'This will permanently delete all data. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All',
        style: 'destructive',
        onPress: async () => {
          console.log('[Settings] Starting clear...');
          try {
            const success = await clearDatabase();
            console.log('[Settings] Clear result:', success);
            if (success) {
              console.log('[Settings] Dispatching empty state to Redux');
              dispatch(setSettings({ ...settings, isNewUser: true })); // Reset specific settings if needed or just keep simplistic
              dispatch(setCollections([]));
              dispatch(setLedger([]));
              setSuccessMessage('Database cleared');
              setSuccessDialogOpen(true);
            } else {
              console.error('[Settings] Clear returned false');
            }
          } catch (e) {
            console.error('[Settings] Clear failed:', e);
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-background pt-12">
        <View className="relative flex-row items-center justify-center border-b border-border bg-background px-5 py-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-5"
            onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-bold text-foreground">Configuration</Text>
        </View>

        <ScrollView contentContainerClassName="p-5 gap-8">
          {/* Appearance */}
          <View className="gap-4">
            <Text className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Appearance
            </Text>
            <View className="overflow-hidden rounded-2xl border border-border bg-card">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                    {colorScheme === 'dark' ? (
                      <Icon as={Moon} size={18} fill={'black'} color={'black'} />
                    ) : (
                      <Icon as={Sun} size={18} fill={'white'} color={'white'} />
                    )}
                  </View>
                  <View>
                    <Text className="font-semibold text-foreground">Dark Mode</Text>
                    <Text className="text-xs text-muted-foreground">
                      Adjust layout for low light
                    </Text>
                  </View>
                </View>
                <Switch
                  checked={colorScheme === 'dark'}
                  onCheckedChange={(checked) => setColorScheme(checked ? 'dark' : 'light')}
                />
              </View>
            </View>
          </View>

          {/* Organization */}
          <View className="gap-4">
            <Text className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Organization
            </Text>
            <View className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              <View className="flex-row items-center gap-3 p-4">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <Icon as={Store} size={18} color={colorScheme === 'dark' ? 'black' : 'white'} />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 font-semibold text-foreground">Organization Name</Text>
                  <Input
                    className="h-9 border-0 bg-muted/50"
                    placeholder="Enter name"
                    value={settings.organizationName}
                    onChangeText={(text) => dispatch(updateOrganizationName(text))}
                  />
                </View>
              </View>

              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Icon as={Globe} size={18} color={colorScheme === 'dark' ? 'black' : 'white'} />
                  </View>
                  <View>
                    <Text className="font-semibold text-foreground">Currency</Text>
                  </View>
                </View>
                <Select
                  value={{
                    value: settings.userCurrency,
                    label:
                      CURRENCIES.find((c) => c.value === settings.userCurrency)?.label ||
                      settings.userCurrency,
                  }}
                  onValueChange={(option) => option && dispatch(updateCurrency(option.value))}>
                  <SelectTrigger className="justify-end border-0 bg-transparent pr-0">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="mr-12 w-2/3">
                    <SelectGroup>
                      {CURRENCIES.map((currency) => (
                        <SelectItem
                          key={currency.value}
                          label={currency.label}
                          value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </View>
            </View>
          </View>

          {/* Data Management */}
          <View className="gap-4">
            <Text className="ml-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Data Management
            </Text>
            <View className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              <Button
                variant="ghost"
                className="h-auto w-full flex-col items-stretch justify-start p-0"
                onPress={handleExport}
                disabled={isExporting}>
                <View className="w-full flex-row items-center justify-between p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Icon as={FileDown} size={18} className="text-primary-foreground" />
                    </View>
                    <Text className="font-semibold text-foreground">Export Data</Text>
                  </View>
                  <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
                </View>
              </Button>

              <Button
                variant="ghost"
                className="h-auto w-full flex-col items-stretch justify-start p-0"
                onPress={handleImport}
                disabled={isImporting}>
                <View className="w-full flex-row items-center justify-between p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Icon as={FileUp} size={18} className="text-primary-foreground" />
                    </View>
                    <Text className="font-semibold text-foreground">Import Data</Text>
                  </View>
                  <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
                </View>
              </Button>

              <Button
                variant="ghost"
                className="h-auto w-full flex-col items-stretch justify-start p-0"
                onPress={handleSeed}>
                <View className="w-full flex-row items-center justify-between p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Icon as={Database} size={18} className="text-primary-foreground" />
                    </View>
                    <Text className="font-semibold text-foreground">Seed Database (Demo)</Text>
                  </View>
                  <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
                </View>
              </Button>

              <Button
                variant="ghost"
                className="h-auto w-full flex-col items-stretch justify-start p-0"
                onPress={handleClear}>
                <View className="w-full flex-row items-center justify-between p-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                      <Icon as={Trash2} size={18} className="text-primary-foreground" />
                    </View>
                    <Text className="font-semibold text-foreground">Clear All Data</Text>
                  </View>
                  <Icon as={ChevronRight} size={20} className="text-muted-foreground" />
                </View>
              </Button>
            </View>
          </View>
        </ScrollView>

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Success</DialogTitle>
              <DialogDescription>{successMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button>
                  <Text>OK</Text>
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>
    </>
  );
}
