import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Platform, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, updateItem } from '@/lib/store/slices/inventorySlice';
import { RootState } from '@/lib/store';
import { CollectionItem } from '@/lib/types';

export default function ItemFormScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { catalogId, itemId } = useLocalSearchParams<{ catalogId: string; itemId?: string }>();
  const collections = useSelector((state: RootState) => state.inventory.collections);
  const collection = collections.find((c) => c.id === catalogId);
  const existingItem = collection?.data.find((i) => i.id === itemId);

  const [values, setValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (existingItem) {
      setValues(existingItem.values);
    }
  }, [existingItem]);

  const handleSave = () => {
    if (!collection) return;

    if (itemId && existingItem) {
      // Update existing item
      dispatch(
        updateItem({
          collectionId: catalogId,
          itemId: itemId,
          updates: values,
        })
      );
    } else {
      // Add new item
      const newItem: CollectionItem = {
        id: Date.now().toString(),
        values: values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(
        addItem({
          collectionId: catalogId,
          item: newItem,
        })
      );
    }
    router.back();
  };

  const renderFieldInput = (field: any) => {
    switch (field.type) {
      case 'boolean':
        return (
          <View className="flex-row items-center justify-between">
            <Text className="text-base">{field.label}</Text>
            <Switch
              checked={!!values[field.key]}
              onCheckedChange={(val) => setValues({ ...values, [field.key]: val })}
            />
          </View>
        );
      case 'select':
        return (
          <Select
            value={{
              value: values[field.key],
              label: values[field.key] || 'Select...',
            }}
            onValueChange={(option) => {
              if (option) {
                setValues({ ...values, [field.key]: option.value });
              }
            }}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {field.options?.map((opt: string) => (
                  <SelectItem key={opt} label={opt} value={opt} />
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );
      case 'currency':
        return (
          <View>
            <Input
              placeholder="0.00"
              value={values[field.key]?.toString() || ''}
              onChangeText={(text) => {
                // Allow only numbers and decimal
                const clean = text.replace(/[^0-9.]/g, '');
                setValues({ ...values, [field.key]: clean });
              }}
              keyboardType="numeric"
            />
          </View>
        );
      case 'date':
        // Simple text input for date for now
        return (
          <Input
            placeholder="YYYY-MM-DD"
            value={values[field.key] || ''}
            onChangeText={(text) => setValues({ ...values, [field.key]: text })}
          />
        );
      case 'number':
        return (
          <Input
            placeholder={field.label}
            value={values[field.key]?.toString() || ''}
            onChangeText={(text) => {
              const num = parseFloat(text);
              setValues({ ...values, [field.key]: isNaN(num) ? text : num });
            }}
            keyboardType="numeric"
          />
        );
      default:
        return (
          <Input
            placeholder={field.label}
            value={values[field.key] || ''}
            onChangeText={(text) => setValues({ ...values, [field.key]: text })}
          />
        );
    }
  };

  if (!collection) return null;

  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-background">
        <View className="z-10 flex-row items-center justify-between border-b border-border bg-card px-5 pb-6 pt-6">
          <Button variant="ghost" size="icon" onPress={() => router.back()} className="-ml-2">
            <Icon as={X} size={24} className="text-foreground" />
          </Button>
          <Text className="text-lg font-bold text-foreground">
            {itemId ? 'Edit Item' : 'New Item'}
          </Text>
          <Button variant="ghost" onPress={handleSave}>
            <Text className="font-bold text-primary">Save</Text>
          </Button>
        </View>

        <ScrollView contentContainerClassName="p-5 gap-8 pb-32">
          {/* Item Details Section */}
          <View>
            <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Item Details
            </Text>
            <View className="gap-4">
              {collection.schema.map((field, index) => (
                <Card
                  key={field.key}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <CardContent className="gap-2 p-4">
                    <Text className="text-sm font-medium uppercase text-muted-foreground">
                      {field.label}
                    </Text>
                    {renderFieldInput(field)}
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
