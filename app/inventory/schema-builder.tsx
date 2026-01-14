import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Stack, useRouter } from 'expo-router';
import { Plus, X, Type, Hash, ToggleLeft, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addCollection } from '@/lib/store/slices/inventorySlice';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'image' | 'currency';

interface SchemaField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: any;
}

export default function SchemaBuilderScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schema, setSchema] = useState<SchemaField[]>([
    { key: 'name', label: 'Item Name', type: 'text', required: true },
  ]);

  const handleAddField = () => {
    const newField: SchemaField = {
      key: `field_${Date.now()}`,
      label: 'New Attribute',
      type: 'text',
      required: false,
    };
    setSchema([...schema, newField]);
  };

  const updateField = (index: number, updates: Partial<SchemaField>) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...updates };
    // Update key if label changes to simplify
    if (updates.label) {
      newSchema[index].key = updates.label.toLowerCase().replace(/\s+/g, '_');
    }
    setSchema(newSchema);
  };

  const removeField = (index: number) => {
    if (index === 0) return; // Prevent removing primary field
    const newSchema = schema.filter((_, i) => i !== index);
    setSchema(newSchema);
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    dispatch(
      addCollection({
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        schema: schema,
        data: [],
      })
    );
    router.back();
  };

  const getIconForType = (type: FieldType) => {
    switch (type) {
      case 'text':
        return Type;
      case 'number':
        return Hash;
      case 'boolean':
        return ToggleLeft;
      case 'image':
        return ImageIcon;
      default:
        return Type;
    }
  };

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
          <Text className="text-lg font-bold text-foreground">New Collection</Text>
          <Button variant="ghost" onPress={handleCreate} disabled={!name.trim()}>
            <Text className={!name.trim() ? 'text-muted-foreground' : 'font-bold text-primary'}>
              Create
            </Text>
          </Button>
        </View>

        <ScrollView contentContainerClassName="p-5 gap-8 pb-32">
          {/* Identity Section */}
          <View>
            <Text className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Collection Identity
            </Text>
            <View className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <Input
                className="h-auto border-0 p-0 text-4xl font-black text-foreground placeholder:text-muted-foreground/50"
                placeholder="Sneakers"
                value={name}
                onChangeText={setName}
                autoFocus
              />
              <Input
                className="mt-2 h-auto border-0 p-0 text-base text-muted-foreground"
                placeholder="Add a description..."
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Schema Section */}
          <View>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Schema</Text>
              <Text className="text-sm text-muted-foreground">
                {schema.length} Attributes defined
              </Text>
            </View>

            <Text className="mb-6 text-muted-foreground">
              Define the attributes for items in this collection. These fields will build your form.
            </Text>

            <View className="gap-4">
              {schema.map((field, index) => (
                <Animated.View
                  key={index} // Ideally use unique ID, but index is okay for simple append
                  layout={Layout.springify()}
                  entering={FadeInDown}>
                  <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <CardContent className="flex-row items-center gap-3 p-4">
                      <View className="flex-1 gap-2">
                        <Input
                          value={field.label}
                          onChangeText={(text) => updateField(index, { label: text })}
                          className="h-auto border-0 bg-transparent p-0 text-lg font-bold"
                          placeholder="Attribute Name"
                        />
                      </View>

                      <View className="flex-row items-center gap-2">
                        <Select
                          value={{ value: field.type, label: field.type.toUpperCase() }}
                          onValueChange={(opt) =>
                            opt && updateField(index, { type: opt.value as FieldType })
                          }>
                          <SelectTrigger className="h-9 w-[110px] rounded-full border-0 bg-muted/50 px-3">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem label="TEXT" value="text" />
                              <SelectItem label="NUMBER" value="number" />
                              <SelectItem label="BOOLEAN" value="boolean" />
                              <SelectItem label="IMAGE" value="image" />
                              <SelectItem label="DATE" value="date" />
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        {index !== 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-destructive/10"
                            onPress={() => removeField(index)}>
                            <Icon as={Trash2} size={16} className="text-destructive" />
                          </Button>
                        )}
                        {index === 0 && <View className="w-8" />}
                      </View>
                    </CardContent>
                  </Card>
                </Animated.View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="absolute bottom-10 left-0 right-0 px-6">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleAddField}
            className="h-14 w-full flex-row items-center justify-center rounded-full bg-primary shadow-lg">
            <Icon as={Plus} size={24} className="mr-2 text-primary-foreground" />
            <Text className="text-lg font-bold text-primary-foreground">Add Attribute</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
