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
import { Edit, X, Pencil, ArrowLeft } from 'lucide-react-native';

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

  // Remove inline editing state
  // const [isEditing, setIsEditing] = useState(false);
  // const [editedValues, setEditedValues] = useState<Record<string, any>>(item?.values || {});

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
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-background pt-12">
        {/* Custom Header */}
        <View className="flex-row items-center justify-between px-5 pb-6">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}
            className="-ml-3 h-10 w-10 rounded-full">
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-bold uppercase tracking-widest text-foreground">
            Item Details
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView className="flex-1" contentContainerClassName="p-6 pt-0 pb-32">
          {/* Header Title Section */}
          <View className="mb-6">
            <Text className="mb-1 text-3xl font-black text-foreground">
              {item.values[collection.schema[0]?.key] || 'Untitled Item'}
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
            {collection.schema.map((field) => {
              // Skip the main title field (assumed first) in the details list if desired,
              // but typically inventory details show all fields.

              let displayValue = formatValue(item.values[field.key], field.type);

              // Simplified styling for specific types
              const isCurrency = field.type === 'currency';

              return (
                <View key={field.key} className="flex-row items-center justify-between py-4">
                  <Text className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {field.label}
                  </Text>
                  <Text
                    className={`text-right text-base font-semibold ${isCurrency ? 'font-bold' : 'text-foreground'}`}>
                    {displayValue}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Fixed Edit FAB */}
        <View className="absolute bottom-10 right-6">
          <Pressable
            onPress={() => router.push(`/inventory/${catalogId}/item-form?itemId=${itemId}`)}
            className="h-16 w-16 items-center justify-center rounded-full bg-black shadow-xl dark:bg-white">
            <Icon as={Pencil} size={28} className="text-white dark:text-black" />
          </Pressable>
        </View>
      </View>
    </>
  );
}
