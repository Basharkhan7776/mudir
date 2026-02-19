import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  addOrganization,
  deleteOrganization,
  updateOrganization,
} from '@/lib/store/slices/ledgerSlice';
import { RootState } from '@/lib/store';
import { Stack, useRouter, Link } from 'expo-router';
import { Plus, Trash2, ChevronRight, Pencil, ArrowLeft } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { createStaggeredAnimation } from '@/lib/animations';
import { searchOrganizations } from '@/components/fuzzy-search';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LedgerListItem = React.memo(
  ({
    item,
    isSelected,
    isSelectionMode,
    onPress,
    onLongPress,
    index,
  }: {
    item: any;
    isSelected: boolean;
    isSelectionMode: boolean;
    onPress: (id: string) => void;
    onLongPress: (id: string) => void;
    index: number;
  }) => {
    return (
      <Animated.View
        entering={createStaggeredAnimation(index - 2).withInitialValues({ opacity: 0 })}
        exiting={FadeOutUp.duration(200)}
        layout={LinearTransition.duration(300).damping(30)}
        className="mb-4 px-5">
        <Link href={`/ledger/${item.organization.id}`} asChild={!isSelectionMode}>
          <Pressable
            delayLongPress={200}
            onLongPress={() => onLongPress(item.organization.id)}
            onPress={() => onPress(item.organization.id)}
            disabled={isSelectionMode ? false : undefined}>
            <Card
              className={`w-full flex-row items-center rounded-2xl border-0 p-4 shadow-sm ${
                isSelected ? 'bg-secondary/30' : 'bg-card'
              }`}>
              <View className="mr-4 items-center justify-center">
                <View
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? 'scale-150 bg-blue-500' : 'bg-primary'
                  }`}
                />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-lg font-bold text-foreground">{item.organization.name}</Text>
                <Text className="text-xs font-semibold uppercase text-muted-foreground/70">
                  {item.organization.phone || 'NO CONTACT'}
                </Text>
              </View>
              {!isSelectionMode && (
                <Icon as={ChevronRight} size={20} className="text-gray-300 dark:text-gray-600" />
              )}
            </Card>
          </Pressable>
        </Link>
      </Animated.View>
    );
  }
);
export default function LedgerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const entries = useSelector((state: RootState) => state.ledger.entries);
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedIds.size > 0;

  // New Organization State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null); // Use proper type if available
  const [orgName, setOrgName] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveOrg = () => {
    if (orgName.trim()) {
      if (editingOrg) {
        dispatch(
          updateOrganization({
            organizationId: editingOrg.id,
            updates: {
              name: orgName.trim(),
              phone: orgPhone,
            },
          })
        );
      } else {
        dispatch(
          addOrganization({
            id: Date.now().toString(),
            name: orgName.trim(),
            phone: orgPhone,
          })
        );
      }
      closeDialog();
    }
  };

  const openCreateDialog = () => {
    setEditingOrg(null);
    setOrgName('');
    setOrgPhone('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (org: any) => {
    setEditingOrg(org);
    setOrgName(org.name);
    setOrgPhone(org.phone || '');
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingOrg(null);
    setOrgName('');
    setOrgPhone('');
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleLongPress = React.useCallback(
    (id: string) => {
      if (!isSelectionMode) {
        setSelectedIds(new Set([id]));
      }
    },
    [isSelectionMode]
  );

  const handlePress = React.useCallback(
    (id: string) => {
      if (isSelectionMode) {
        toggleSelection(id);
      } else {
        router.push(`/ledger/${id}`);
      }
    },
    [isSelectionMode, toggleSelection, router]
  );

  const handleBatchDelete = () => {
    selectedIds.forEach((id) => {
      dispatch(deleteOrganization(id));
    });
    setSelectedIds(new Set());
  };

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;

    const results = searchOrganizations(
      entries.map((e) => e.organization),
      searchQuery
    );
    return results
      .map((r) => {
        const org = r.item as unknown as { id: string };
        return entries.find((e) => e.organization.id === org.id);
      })
      .filter(Boolean);
  }, [entries, searchQuery]);

  const listData = useMemo(() => {
    const data: any[] = [{ id: 'TITLE_HEADER' }, { id: 'SEARCH_HEADER' }];
    if (filteredEntries.length === 0) {
      data.push({ id: 'EMPTY_STATE' });
    } else {
      data.push(...filteredEntries);
    }
    return data;
  }, [filteredEntries]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-background pt-12">
        <Animated.FlatList
          data={listData}
          keyExtractor={(item) =>
            item.id === 'TITLE_HEADER' || item.id === 'SEARCH_HEADER' || item.id === 'EMPTY_STATE'
              ? item.id
              : item.organization.id
          }
          stickyHeaderIndices={[1]}
          contentContainerClassName="pb-24"
          renderItem={({ item, index }) => {
            if (item.id === 'TITLE_HEADER') {
              return (
                <View className="flex-row items-center justify-between px-5 pb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={() => router.back()}
                    className="-ml-3 mt-1">
                    <Icon as={ArrowLeft} size={24} className="text-foreground" />
                  </Button>
                  <Text className="flex-1 text-center text-3xl font-bold text-foreground">
                    Organizations
                  </Text>
                  <View className="w-10" />
                </View>
              );
            }

            if (item.id === 'SEARCH_HEADER') {
              return (
                <View className="bg-background px-5 pb-6 pt-2">
                  <Input
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="h-12 rounded-full border-0 bg-secondary/50 px-6"
                  />
                </View>
              );
            }

            if (item.id === 'EMPTY_STATE') {
              return (
                <View className="items-center justify-center p-8">
                  <Text className="text-muted-foreground">No organizations found.</Text>
                </View>
              );
            }

            const isSelected = selectedIds.has(item.organization.id);

            return (
              <LedgerListItem
                key={item.organization.id}
                item={item}
                index={index}
                isSelected={isSelected}
                isSelectionMode={isSelectionMode}
                onPress={handlePress}
                onLongPress={handleLongPress}
              />
            );
          }}
        />

        {/* Floating Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          className="pointer-events-box-none absolute bottom-0 left-0 right-0 flex-row items-end justify-between px-6 pb-6"
          style={{ paddingBottom: insets.bottom + 6 }}>
          {/* Edit Button */}
          {isSelectionMode && selectedIds.size === 1 && (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  const id = Array.from(selectedIds)[0];
                  const org = entries.find((e) => e.organization.id === id)?.organization;
                  if (org) {
                    openEditDialog(org);
                  }
                  setSelectedIds(new Set());
                }}
                className="h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                <Icon as={Pencil} size={24} className="text-white dark:text-black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Add Button */}
          {!isSelectionMode && (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openCreateDialog}
                className="h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                <Icon as={Plus} size={28} className="text-white dark:text-black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Delete Button */}
          {isSelectionMode && selectedIds.size > 0 && (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                    <Icon as={Trash2} size={24} className="text-white dark:text-black" />
                  </TouchableOpacity>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Organizations</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} organization(s)?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction onPress={handleBatchDelete}>
                      <Text>Delete</Text>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Animated.View>
          )}
        </Animated.View>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingOrg ? 'Edit Organization' : 'New Organization'}</DialogTitle>
              <DialogDescription>
                {editingOrg
                  ? "Make changes to the organization's profile here."
                  : 'Add a new organization to your ledger.'}
              </DialogDescription>
            </DialogHeader>
            <View className="gap-4 py-4">
              <View className="gap-2">
                <Text className="text-sm font-medium">Name</Text>
                <Input value={orgName} onChangeText={setOrgName} placeholder="Organization Name" />
              </View>
              <View className="gap-2">
                <Text className="text-sm font-medium">Phone</Text>
                <Input
                  value={orgPhone}
                  onChangeText={setOrgPhone}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            <DialogFooter>
              <Button onPress={handleSaveOrg}>
                <Text>{editingOrg ? 'Save Changes' : 'Create Organization'}</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>
    </>
  );
}
