import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { removeReceiptItem, addReceiptItem, updateReceiptItem } from '@/lib/store/slices/receiptsSlice';
import { RootState } from '@/lib/store';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2, Check, X, Pencil, Share } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutUp, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { createStaggeredAnimation } from '@/lib/animations';
import { generateReceiptPDF } from '@/lib/pdfGenerator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
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

export default function ReceiptDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const receipt = useSelector((state: RootState) =>
    state.receipts.list.find((r) => r.id === id)
  );

  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
  const orgName = useSelector((state: RootState) => state.settings.organizationName);

  // Modal State
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedIds.size > 0;
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [isPrintingPDF, setIsPrintingPDF] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const toggleSelection = (itemId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedIds(newSelected);
  };

  const handleLongPress = React.useCallback(
    (itemId: string) => {
      if (!isSelectionMode) {
        setSelectedIds(new Set([itemId]));
      }
    },
    [isSelectionMode]
  );

  const handlePress = React.useCallback(
    (itemId: string) => {
      if (isSelectionMode) {
        toggleSelection(itemId);
      } else {
        toggleSelection(itemId); // In this list, tap always selects
      }
    },
    [isSelectionMode, toggleSelection]
  );

  const handleBatchDelete = () => {
    selectedIds.forEach((itemId) => {
      dispatch(removeReceiptItem({ receiptId: receipt.id, itemId }));
    });
    setSelectedIds(new Set());
  };

  const handleAddItem = () => {
    if (!itemName.trim()) {
      Alert.alert('Validation Error', 'Item Name is required.');
      return;
    }

    const numericPrice = parseFloat(price);
    const numericQuantity = parseFloat(quantity);

    if (isNaN(numericPrice) || numericPrice < 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive price.');
      return;
    }

    if (isNaN(numericQuantity) || numericQuantity <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive quantity.');
      return;
    }

    if (editingItemId) {
      dispatch(
        updateReceiptItem({
          receiptId: receipt!.id,
          item: {
            id: editingItemId,
            name: itemName.trim(),
            price: numericPrice,
            quantity: numericQuantity,
          },
        })
      );
    } else {
      dispatch(
        addReceiptItem({
          receiptId: receipt!.id,
          item: {
            id: Date.now().toString(),
            name: itemName.trim(),
            price: numericPrice,
            quantity: numericQuantity,
          },
        })
      );
    }

    setIsAddItemModalOpen(false);
    setItemName('');
    setPrice('');
    setQuantity('');
    setEditingItemId(null);
  };

  const totalAmount = useMemo(() => {
    if (!receipt) return 0;
    return receipt.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [receipt]);

  const handlePrintPDF = async () => {
    try {
      setIsPrintingPDF(true);
      await generateReceiptPDF(
        receipt,
        currencySymbol,
        orgName || 'Mudir'
      );
      setSuccessMessage('PDF generated successfully!');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPrintingPDF(false);
    }
  };

  if (!receipt) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Receipt not found</Text>
        <Button variant="ghost" onPress={() => router.back()} className="mt-4">
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-background pt-12">
        <View className="flex-row items-center justify-between px-5 pb-4">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
            className="-ml-3 mt-1">
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </Button>
          <Text className="flex-1 text-center text-2xl font-bold text-foreground" numberOfLines={1}>
            {receipt.customerName}
          </Text>
          <Button
            variant="ghost"
            size="icon"
            onPress={handlePrintPDF}
            disabled={isPrintingPDF}
            className="-mr-3 mt-1">
            {isPrintingPDF ? (
              <ActivityIndicator size="small" />
            ) : (
              <Icon as={Share} size={24} className="text-foreground" />
            )}
          </Button>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="pb-32 pt-2 px-5 gap-6">
          {/* Metadata Card */}
          <Animated.View entering={FadeInDown}>
            <Card className="rounded-2xl border border-border bg-background p-4 shadow-sm">
              <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Amount
              </Text>
              <Text className="text-4xl font-black tracking-tighter text-foreground mt-1">
                {currencySymbol}{totalAmount.toLocaleString()}
              </Text>
              <View className="mt-4 flex-row justify-between">
                 <View>
                   <Text className="text-[10px] font-semibold text-muted-foreground">DATE</Text>
                   <Text className="text-xs font-bold text-foreground">
                      {new Date(receipt.date).toLocaleDateString()}
                   </Text>
                 </View>
                 <View>
                   <Text className="text-[10px] font-semibold text-muted-foreground text-right">ITEMS</Text>
                   <Text className="text-xs font-bold text-foreground text-right">
                      {receipt.items.length}
                   </Text>
                 </View>
              </View>
            </Card>
          </Animated.View>

          {/* Items List */}
          <View className="gap-4">
            <Text className="text-xl font-bold text-foreground">Items</Text>
            {receipt.items.length === 0 ? (
              <View className="py-8 items-center justify-center border-2 border-dashed border-border rounded-2xl">
                <Text className="text-muted-foreground text-center">No items added yet</Text>
              </View>
            ) : (
              receipt.items.map((item, index) => {
                const isSelected = selectedIds.has(item.id);
                return (
                <Animated.View
                  key={item.id}
                  entering={createStaggeredAnimation(index).withInitialValues({ opacity: 0 })}
                  exiting={FadeOutUp}>
                  <Pressable 
                    delayLongPress={200}
                    onLongPress={() => handleLongPress(item.id)}
                    onPress={() => handlePress(item.id)}>
                    <Card className={`flex-row items-center justify-between rounded-2xl border-0 p-4 shadow-sm ${isSelected ? 'bg-secondary/30' : 'bg-card'}`}>
                      <View className="flex-1 pr-4">
                        <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text className="text-sm text-muted-foreground mt-1">
                          {item.quantity} x {currencySymbol}{item.price.toLocaleString()}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-4">
                        <Text className="text-xl font-black text-foreground">
                          {currencySymbol}{(item.price * item.quantity).toLocaleString()}
                        </Text>
                      </View>
                    </Card>
                  </Pressable>
                </Animated.View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Floating Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          className="pointer-events-box-none absolute bottom-0 left-0 right-0 flex-row items-end justify-between px-6 pb-6"
          style={{ paddingBottom: insets.bottom + 6 }}>
          
          {/* Edit Button */}
          {isSelectionMode && selectedIds.size === 1 ? (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown} className="pointer-events-auto">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  const id = Array.from(selectedIds)[0];
                  const item = receipt.items.find(i => i.id === id);
                  if (item) {
                    setEditingItemId(item.id);
                    setItemName(item.name);
                    setPrice(item.price.toString());
                    setQuantity(item.quantity.toString());
                    setIsAddItemModalOpen(true);
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
                onPress={() => {
                  setEditingItemId(null);
                  setItemName('');
                  setPrice('');
                  setQuantity('');
                  setIsAddItemModalOpen(true);
                }}
                className="h-14 w-14 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                <Icon as={Plus} size={28} className="text-white dark:text-black" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown} exiting={FadeOutDown} className="pointer-events-auto">
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
                    <AlertDialogTitle>Delete Items</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} item(s)?
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

      {/* Add/Edit Item Modal */}
      <Modal
        visible={isAddItemModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => {
           setIsAddItemModalOpen(false);
           setEditingItemId(null);
        }}>
          <View className="flex-1 justify-end bg-black/50">
            <Pressable className="absolute inset-0" onPress={() => {
                setIsAddItemModalOpen(false);
                setEditingItemId(null);
            }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View className="rounded-t-3xl bg-card pt-4 pb-4">
              <View className="flex-row items-center justify-between px-5 pb-4 border-b border-border">
                <Text className="text-xl font-bold text-foreground">
                  {editingItemId ? 'Edit Item' : 'New Item'}
                </Text>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => {
                     setIsAddItemModalOpen(false);
                     setEditingItemId(null);
                  }}
                  className="-mr-3">
                  <Icon as={X} size={24} className="text-foreground" />
                </Button>
              </View>

              <View className="px-5 mt-4 gap-6">
                <View className="gap-2">
                  <Text className="ml-1 text-sm font-semibold uppercase text-muted-foreground">
                    Name of Item *
                  </Text>
                  <Input
                    value={itemName}
                    onChangeText={setItemName}
                    placeholder="E.g., Milk 1L"
                    className="h-14 rounded-2xl bg-secondary/50 px-5 text-lg"
                  />
                </View>

                <View className="gap-2">
                  <Text className="ml-1 text-sm font-semibold uppercase text-muted-foreground">
                    Price *
                  </Text>
                  <Input
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    className="h-14 rounded-2xl bg-secondary/50 px-5 text-lg"
                  />
                </View>

                <View className="gap-2">
                  <Text className="ml-1 text-sm font-semibold uppercase text-muted-foreground">
                    Quantity *
                  </Text>
                  <Input
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="1"
                    keyboardType="number-pad"
                    className="h-14 rounded-2xl bg-secondary/50 px-5 text-lg"
                  />
                </View>
                
                <View className="mt-2" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
                  <Button
                    size="lg"
                    className="w-full flex-row items-center justify-center gap-2 rounded-2xl h-14"
                    onPress={handleAddItem}>
                    <Icon as={Check} size={20} className="text-primary-foreground" />
                    <Text className="text-lg font-bold text-primary-foreground">{editingItemId ? 'Save Changes' : 'Add Item'}</Text>
                  </Button>
                </View>
              </View>
            </View>
            </KeyboardAvoidingView>
          </View>
      </Modal>

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
    </>
  );
}
