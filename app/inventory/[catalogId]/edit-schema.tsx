import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, X, Trash2 } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateCollection } from '@/lib/store/slices/inventorySlice';
import { RootState } from '@/lib/store';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SchemaField } from '@/lib/types';

type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'image' | 'currency';

export default function EditSchemaScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { catalogId } = useLocalSearchParams<{ catalogId: string }>();
  const collections = useSelector((state: RootState) => state.inventory.collections);
  const collection = collections.find((c) => c.id === catalogId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schema, setSchema] = useState<SchemaField[]>([]);

  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description || '');
      setSchema(collection.schema);
    }
  }, [collection]);

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

  const handleSave = () => {
    if (!name.trim() || !collection) return;

    dispatch(
      updateCollection({
        ...collection,
        name: name.trim(),
        description: description.trim(),
        schema: schema,
      })
    );
    router.back();
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
          <Text className="text-lg font-bold text-foreground">Edit Collection</Text>
          <Button variant="ghost" onPress={handleSave} disabled={!name.trim()}>
            <Text className={!name.trim() ? 'text-muted-foreground' : 'font-bold text-primary'}>
              Save
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
                className="h-auto border-0 text-4xl font-black text-foreground placeholder:text-muted-foreground/50"
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <Input
                className="mt-2 h-auto border-0 text-base text-muted-foreground"
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
              Modify the attributes for items in this collection.
            </Text>

            <View className="gap-4">
              {schema.map((field, index) => (
                <Animated.View key={index} layout={Layout.springify()} entering={FadeInDown}>
                  <Card className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <CardContent className="gap-3 p-4">
                      <View className="flex-row items-center gap-3">
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
                      </View>

                      <View className="flex-row items-center justify-between border-t border-border pt-3">
                        <Text className="text-sm font-medium text-muted-foreground">Required</Text>
                        <Switch
                          checked={field.required || false}
                          onCheckedChange={(val) => updateField(index, { required: val })}
                        />
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
