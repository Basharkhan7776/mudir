import React, { useState } from 'react';
import { View, ScrollView, Image, Platform, InteractionManager, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { deleteItem, updateItem } from '@/lib/store/slices/inventorySlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
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
  Trash2,
  Edit,
  X,
  Check,
  Calendar,
  DollarSign,
  Hash,
  Type,
  List,
} from 'lucide-react-native';
import { DynamicFieldRenderer } from '@/components/inventory/DynamicFieldRenderer';

export default function ItemDetailScreen() {
  const { catalogId, itemId } = useLocalSearchParams<{ catalogId: string; itemId: string }>();
  const router = useRouter();
  const dispatch = useDispatch();

  const collection = useSelector((state: RootState) =>
    state.inventory.collections.find((c) => c.id === catalogId)
  );

  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);

  const itemStore = collection?.data.find((i) => i.id === itemId);
  // Keep alive
  const [item, setItem] = useState(itemStore);

  React.useEffect(() => {
    if (itemStore) {
      setItem(itemStore);
    }
  }, [itemStore]);

  const [isEditing, setIsEditing] = useState(false);
  // Use cached item safe operators
  const [editedValues, setEditedValues] = useState<Record<string, any>>(item?.values || {});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const navigation = useNavigation();

  if (!collection || !item) {
    return (
      <>
        <Stack.Screen options={{ title: 'Item Not Found' }} />
        <View className="flex-1 items-center justify-center">
          <Text>Item not found</Text>
        </View>
      </>
    );
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setDeleteDialogOpen(false);
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace(`/inventory/${catalogId}`);
    }

    // Dispatch after navigation (increased timeout)
    setTimeout(() => {
      dispatch(deleteItem({ collectionId: catalogId, itemId }));
    }, 1000);
  };

  const handleSave = () => {
    // Validate required fields
    const isValid = collection.schema.every((field) => {
      if (field.required && !editedValues[field.key]) return false;
      return true;
    });

    if (!isValid) {
      setErrorMessage('Please fill all required fields');
      setErrorDialogOpen(true);
      return;
    }

    dispatch(
      updateItem({
        collectionId: catalogId,
        itemId,
        updates: editedValues,
      })
    );

    setIsEditing(false);
    setSuccessDialogOpen(true);
  };

  const handleCancel = () => {
    setEditedValues(item?.values || {});
    setIsEditing(false);
  };

  const updateValue = (key: string, value: any) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const formatValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return 'N/A';

    switch (fieldType) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'currency':
        return `${currencySymbol}${value} `;
      default:
        return value.toString();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text className="text-sm font-bold uppercase tracking-widest text-foreground">
              ITEM DETAILS
            </Text>
          ),
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="-ml-2 p-2">
              <Icon as={X} size={24} className="text-foreground" />
            </Pressable>
          ),
          headerRight: () => null, // Remove Edit button from header
        }}
      />
      <View className="flex-1 bg-background">
        <ScrollView className="flex-1" contentContainerClassName="p-6 pb-24">
          {/* Header Title Section */}
          <View className="mb-6">
            <Text className="mb-1 text-3xl font-black text-foreground">
              {(isEditing ? editedValues : item.values)[collection.schema[0]?.key] ||
                'Untitled Item'}
            </Text>
            <Text className="text-sm font-medium text-muted-foreground">
              Added:{' '}
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}{' '}
              by Admin
            </Text>
          </View>

          {/* Divider */}
          <View className="mb-6 h-[1px] bg-border" />

          {/* Content Area */}
          <View className="gap-6">
            {isEditing
              ? // Edit Form
                collection.schema.map((field) => (
                  <DynamicFieldRenderer
                    key={field.key}
                    field={field}
                    value={editedValues[field.key] ?? field.defaultValue}
                    onChange={(value) => updateValue(field.key, value)}
                  />
                ))
              : // Clean Details List
                collection.schema.map((field) => {
                  // Skip the main title field (assumed first) in the details list if desired,
                  // but typically inventory details show all fields.

                  let displayValue = formatValue(item.values[field.key], field.type);

                  // Simplified styling for specific types
                  const isCurrency = field.type === 'currency';

                  return (
                    <View
                      key={field.key}
                      className="flex-row items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                      <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {field.label}
                      </Text>
                      <Text
                        className={`text-base font-semibold ${isCurrency ? 'font-bold' : 'text-foreground'}`}>
                        {displayValue}
                      </Text>
                    </View>
                  );
                })}
          </View>
        </ScrollView>

        {/* Fixed Footer Actions */}
        <View className="safe-bottom absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-background p-4 dark:border-gray-800">
          {isEditing ? (
            <View className="flex-row gap-4">
              <Button variant="outline" className="h-12 flex-1 rounded-xl" onPress={handleCancel}>
                <Text>Cancel</Text>
              </Button>
              <Button
                className="h-12 flex-1 rounded-xl bg-black dark:bg-white"
                onPress={handleSave}>
                <Text className="font-bold text-white dark:text-black">Save Changes</Text>
              </Button>
            </View>
          ) : (
            <View className="flex-row gap-4">
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-xl border-gray-200 dark:border-gray-700"
                onPress={handleDelete}>
                <Icon as={Trash2} size={18} className="mr-2 text-foreground" />
                <Text className="font-bold text-foreground">Delete</Text>
              </Button>
              <Button
                className="h-12 flex-[1.5] rounded-xl bg-black dark:bg-white"
                onPress={() => setIsEditing(true)}>
                <Icon as={Edit} size={18} className="mr-2 text-white dark:text-black" />
                <Text className="font-bold text-white dark:text-black">Edit Item</Text>
              </Button>
            </View>
          )}
        </View>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  <Text>Cancel</Text>
                </Button>
              </DialogClose>
              <Button variant="destructive" onPress={confirmDelete}>
                <Text className="text-destructive-foreground">Delete</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Error Dialog */}
        <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>{errorMessage}</DialogDescription>
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

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Success</DialogTitle>
              <DialogDescription>Item updated successfully</DialogDescription>
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
