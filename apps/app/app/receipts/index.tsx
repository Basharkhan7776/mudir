import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { deleteReceipt, addReceipt, updateReceipt } from '@/lib/store/slices/receiptsSlice';
import { RootState } from '@/lib/store';
import { Stack, useRouter, Link } from 'expo-router';
import { Plus, Trash2, ChevronRight, ArrowLeft, Check, X, Pencil } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Pressable, TouchableOpacity, Modal, ScrollView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadeOutDown,
  LinearTransition,
} from 'react-native-reanimated';
import { createStaggeredAnimation } from '@/lib/animations';
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
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Receipt } from '@mudir/types';

const ReceiptListItem = React.memo(
  ({
    item,
    isSelected,
    isSelectionMode,
    onPress,
    onLongPress,
    index,
  }: {
    item: Receipt;
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
        <Link href={`/receipts/${item.id}`} asChild={!isSelectionMode}>
          <Pressable
            delayLongPress={200}
            onLongPress={() => onLongPress(item.id)}
            onPress={() => onPress(item.id)}
            disabled={isSelectionMode ? false : undefined}>
            <Card
              className={`w-full flex-row items-center justify-between rounded-2xl border-0 p-4 shadow-sm ${
                isSelected ? 'bg-secondary/30' : 'bg-card'
              }`}>
              <View className="flex-row items-center flex-1">
                <View className="mr-4 items-center justify-center">
                  <View
                    className={`h-2 w-2 rounded-full transition-transform ${
                      isSelected ? 'scale-150 bg-blue-500' : 'scale-100 bg-primary'
                    }`}
                  />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-bold text-foreground">{item.customerName}</Text>
                  <Text className="text-xs font-semibold uppercase text-muted-foreground/70">
                    PhNo: {item.phone || 'N/A'}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-4">
                <Text className="text-2xl font-black text-foreground">
                    {item.items.length}
                </Text>
                {!isSelectionMode && (
                  <Icon as={ChevronRight} size={20} className="text-gray-300 dark:text-gray-600" />
                )}
              </View>
            </Card>
          </Pressable>
        </Link>
      </Animated.View>
    );
  }
);

export default function ReceiptsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const receipts = useSelector((state: RootState) => state.receipts.list);
  const dispatch = useDispatch();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedIds.size > 0;
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingReceiptId, setEditingReceiptId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setEditingReceiptId(null);
    setCustomerName('');
    setPhone('');
    setDescription('');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (receipt: Receipt) => {
    setEditingReceiptId(receipt.id);
    setCustomerName(receipt.customerName);
    setPhone(receipt.phone || '');
    setDescription(receipt.description || '');
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingReceiptId(null);
    setCustomerName('');
    setPhone('');
    setDescription('');
  };

  const handleCreate = () => {
    if (!customerName.trim()) {
      Alert.alert('Validation Error', 'Customer Name is required.');
      return;
    }

    if (editingReceiptId) {
      const existingReceipt = receipts.find((r) => r.id === editingReceiptId);
      if (existingReceipt) {
        dispatch(
          updateReceipt({
            ...existingReceipt,
            customerName: customerName.trim(),
            phone: phone.trim(),
            description: description.trim(),
            updatedAt: new Date().toISOString(), // if you have this property
          })
        );
      }
      closeCreateModal();
    } else {
      const newReceiptId = Date.now().toString();

      dispatch(
        addReceipt({
          id: newReceiptId,
          customerName: customerName.trim(),
          phone: phone.trim(),
          date: new Date().toISOString(),
          description: description.trim(),
          items: [],
          createdAt: new Date().toISOString(),
        })
      );

      closeCreateModal();
      
      // Navigate to new receipt
      setTimeout(() => {
        router.push(`/receipts/${newReceiptId}`);
      }, 100);
    }
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
        router.push(`/receipts/${id}`);
      }
    },
    [isSelectionMode, toggleSelection, router]
  );

  const handleBatchDelete = () => {
    selectedIds.forEach((id) => {
      dispatch(deleteReceipt(id));
    });
    setSelectedIds(new Set());
  };

  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) return receipts;
    const lowerQuery = searchQuery.toLowerCase();
    return receipts.filter((r) => 
        r.customerName.toLowerCase().includes(lowerQuery) || 
        r.phone.includes(lowerQuery) ||
        (r.description && r.description.toLowerCase().includes(lowerQuery))
    );
  }, [receipts, searchQuery]);

  const listData = useMemo(() => {
    const data: any[] = [{ id: 'TITLE_HEADER' }, { id: 'SEARCH_HEADER' }];
    if (filteredReceipts.length === 0) {
      data.push({ id: 'EMPTY_STATE' });
    } else {
      data.push(...filteredReceipts);
    }
    return data;
  }, [filteredReceipts]);

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
          keyExtractor={(item) => item.id}
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
                    Receipts
                  </Text>
                  <View className="w-10" />
                </View>
              );
            }

            if (item.id === 'SEARCH_HEADER') {
              return (
                <View className="bg-background px-5 pb-6 pt-2">
                  <Input
                    placeholder="Search receipts..."
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
                  <Text className="text-muted-foreground">No receipts found.</Text>
                </View>
              );
            }

            const isSelected = selectedIds.has(item.id);

            return (
              <ReceiptListItem
                key={item.id}
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
          {isSelectionMode && selectedIds.size === 1 ? (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown} className="pointer-events-auto">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  const id = Array.from(selectedIds)[0];
                  const receipt = receipts.find((r) => r.id === id);
                  if (receipt) {
                    openEditModal(receipt);
                  }
                  setSelectedIds(new Set());
                }}
                className="h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                <Icon as={Pencil} size={24} className="text-white dark:text-black" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View className="h-14 w-14" />
          )}

          {/* Add/Delete Buttons */}
          {!isSelectionMode ? (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown} className="pointer-events-auto">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openCreateModal}
                className="h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                <Icon as={Plus} size={28} className="text-white dark:text-black" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
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
                    <AlertDialogTitle>Delete Receipts</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} receipt(s)?
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
      </View>

      {/* Create Modal */}
      <Modal
        visible={isCreateModalOpen}
        animationType="slide"
        transparent
        onRequestClose={closeCreateModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 justify-end bg-black/50">
            <Pressable className="absolute inset-0" onPress={closeCreateModal} />
            <View className="rounded-t-3xl bg-card pt-4 max-h-[85%]">
              <View className="flex-row items-center justify-between px-5 pb-4 border-b border-border">
                <Text className="text-xl font-bold text-foreground">
                  {editingReceiptId ? 'Edit Receipt' : 'New Receipt'}
                </Text>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={closeCreateModal}
                  className="-mr-3">
                  <Icon as={X} size={24} className="text-foreground" />
                </Button>
              </View>

              <ScrollView className="px-5 mt-4" contentContainerClassName="gap-6" showsVerticalScrollIndicator={false}>
                <View className="gap-2">
                  <Text className="ml-1 text-sm font-semibold uppercase text-muted-foreground">
                    Customer Name *
                  </Text>
                  <Input
                    value={customerName}
                    onChangeText={setCustomerName}
                    placeholder="E.g., John Doe"
                    className="h-14 rounded-2xl bg-secondary/50 px-5 text-lg"
                  />
                </View>

                <View className="gap-2">
                  <Text className="ml-1 text-sm font-semibold uppercase text-muted-foreground">
                    Phone Number
                  </Text>
                  <Input
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="E.g., +1 234 567 890"
                    keyboardType="phone-pad"
                    className="h-14 rounded-2xl bg-secondary/50 px-5 text-lg"
                  />
                </View>

                <View className="gap-2">
                  <Text className="ml-1 text-sm font-semibold uppercase text-muted-foreground">
                    Description
                  </Text>
                  <Input
                    value={description}
                    onChangeText={setDescription}
                    placeholder="E.g., Monthly supplies"
                    multiline
                    numberOfLines={3}
                    className="h-auto min-h-[100px] rounded-2xl bg-secondary/50 px-5 py-4 text-lg"
                    textAlignVertical="top"
                  />
                </View>
                
                <View className="mt-2" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
                  <Button
                    size="lg"
                    className="w-full flex-row items-center justify-center gap-2 rounded-2xl h-14"
                    onPress={handleCreate}>
                    <Icon as={Check} size={20} className="text-primary-foreground" />
                    <Text className="text-lg font-bold text-primary-foreground">{editingReceiptId ? 'Save Changes' : 'Create'}</Text>
                  </Button>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
