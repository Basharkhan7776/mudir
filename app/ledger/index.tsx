import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { addOrganization, deleteOrganization } from '@/lib/store/slices/ledgerSlice';
import { RootState } from '@/lib/store';
import { Link, Stack } from 'expo-router';
import { Plus, Search, Trash, Menu, ArrowRight, Edit } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Pressable, Alert, FlatList } from 'react-native';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { CollapsingHeaderFlatList } from '@/components/CollapsingHeaderFlatList'; // Kept for now if fallback needed, but unused in new code

export default function LedgerScreen() {
  const entries = useSelector((state: RootState) => state.ledger.entries);
  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newType, setNewType] = useState<'ORG' | 'INDIVIDUAL'>('INDIVIDUAL');
  const [searchQuery, setSearchQuery] = useState('');
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const handleAddParty = () => {
    if (newName.trim()) {
      dispatch(
        addOrganization({
          id: Date.now().toString(),
          name: newName.trim(),
          phone: newPhone,
          // Type is not in Organization schema but was in Party.
          // Assuming Organization schema is just { id, name, phone, email } for now based on types.ts
          // If type is needed, we should add it to schema. For now, ignoring type or storing in name/meta if needed.
          // But wait, the user request showed "organization" object.
        })
      );
      setNewName('');
      setNewPhone('');
      setNewType('INDIVIDUAL');
      setIsAdding(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Organization',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(deleteOrganization(id)),
        },
      ]
    );
  };

  const getBalance = (transactions: any[]) => {
    return transactions.reduce((acc, t) => {
      return t.type === 'CREDIT' ? acc - t.amount : acc + t.amount;
    }, 0);
  };

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;

    const query = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.organization.name.toLowerCase().includes(query) ||
        entry.organization.phone?.toLowerCase().includes(query) ||
        entry.organization.email?.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text className="text-base font-black uppercase tracking-widest text-foreground">
              ORGANIZATIONS
            </Text>
          ),
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            // Simulated Menu Icon - typically opens drawer, using simplistic replacement
            <Pressable className="-ml-2 p-2">
              <Icon as={Menu} size={24} className="text-foreground" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => {}} className="mr-0 p-2">
              <Icon as={Search} size={24} className="text-foreground" />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: '#ffffff', // Ensure white background
          },
        }}
      />
      <View className="relative flex-1 bg-background">
        {/* Search Input (Functional fallback since header search is visual) */}
        <View className="border-b border-gray-100 bg-background px-4 py-2 dark:border-gray-800">
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="h-10 rounded-lg border-0 bg-muted/30 px-3"
          />
        </View>

        {isAdding && (
          <View className="border-b border-border bg-muted/10 px-4 py-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">New Organization</CardTitle>
              </CardHeader>
              <CardContent className="gap-4">
                <Input
                  placeholder="Organization Name"
                  value={newName}
                  onChangeText={setNewName}
                  className="bg-background"
                />
                <Input
                  placeholder="Phone (Optional)"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                  className="bg-background"
                />
              </CardContent>
              <CardFooter className="justify-end gap-3 pt-0">
                <Button variant="ghost" onPress={() => setIsAdding(false)}>
                  <Text>Cancel</Text>
                </Button>
                <Button
                  onPress={handleAddParty}
                  className="bg-black text-white dark:bg-white dark:text-black">
                  <Text className="font-bold text-white dark:text-black">Create</Text>
                </Button>
              </CardFooter>
            </Card>
          </View>
        )}

        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.organization.id}
          contentContainerClassName="pb-24"
          renderItem={({ item }) => {
            // Mock Type since it's not in schema yet
            const orgType = 'CLIENT'; // Default to CLIENT or SUPPLIER based on logic or random for now

            return (
              <Link href={`/ledger/${item.organization.id}`} asChild>
                <Pressable className="flex-row items-center justify-between border-b border-gray-100 bg-background px-5 py-5 active:bg-gray-50 dark:border-gray-800 dark:active:bg-muted/10">
                  <View className="flex-1 gap-1">
                    <Text className="text-lg font-bold text-foreground">
                      {item.organization.name}
                    </Text>
                    <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {item.organization.phone || 'NO CONTACT'}
                    </Text>
                  </View>

                  {/* Actions (Visual) */}
                  <View className="flex-row items-center gap-0">
                    <View className="mr-4">
                      {/* Arrow visual */}
                      <Icon as={ArrowRight} size={20} className="text-foreground" />
                    </View>

                    {/* Action Buttons Container (Simulated Swipe Reveal) */}
                    <View className="flex-row overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <Pressable
                        className="h-10 w-10 items-center justify-center bg-black dark:bg-white"
                        // onPress={() => edit logic}
                      >
                        <Icon as={Edit} size={14} className="text-white dark:text-black" />
                      </Pressable>
                      <Pressable
                        className="h-10 w-10 items-center justify-center border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-black"
                        onPress={(e) => {
                          e.stopPropagation(); // Prevent navigation
                          handleDelete(item.organization.id, item.organization.name);
                        }}>
                        <Icon as={Trash} size={14} className="text-destructive" />
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              </Link>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center p-12 opacity-50">
              <Text className="font-medium text-muted-foreground">No organizations found.</Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <View className="absolute bottom-16 right-6">
          <Pressable
            onPress={() => setIsAdding(true)}
            className="h-16 w-16 items-center justify-center rounded-full bg-black shadow-xl active:scale-95 dark:bg-white">
            <Icon as={Plus} size={32} className="text-white dark:text-black" />
          </Pressable>
        </View>

        {/* Bottom Status Bar */}
        <View className="absolute bottom-0 left-0 right-0 h-10 flex-row items-center justify-between bg-black px-5 dark:border-t dark:border-gray-200 dark:bg-white">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-white dark:text-black">
            STATUS: ONLINE
          </Text>
          <Text className="text-[10px] font-bold uppercase tracking-widest text-white dark:text-black">
            {filteredEntries.length} ORGS
          </Text>
        </View>
      </View>
    </>
  );
}
