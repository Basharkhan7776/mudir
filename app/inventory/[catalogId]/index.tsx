import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { addItem, deleteItem, deleteCollection } from '@/lib/store/slices/inventorySlice';
import { RootState } from '@/lib/store';
import { Link, Stack, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Plus, Trash2, Settings, Search, ArrowLeft, ChevronRight } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { FlatList, View, Pressable, ScrollView, Platform, InteractionManager } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { DynamicFieldRenderer } from '@/components/inventory/DynamicFieldRenderer';

export default function CatalogScreen() {
  const { catalogId } = useLocalSearchParams<{ catalogId: string }>();
  const router = useRouter();
  const collectionStore = useSelector((state: RootState) =>
    state.inventory.collections.find((c) => c.id === catalogId)
  );
  // Keep alive
  const [collection, setCollection] = useState(collectionStore);

  React.useEffect(() => {
    if (collectionStore) {
      setCollection(collectionStore);
    }
  }, [collectionStore]);

  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
  const dispatch = useDispatch();

  const [isAdding, setIsAdding] = useState(false);
  const [newValues, setNewValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [deleteCollectionOpen, setDeleteCollectionOpen] = useState(false);

  const navigation = useNavigation();

  if (!collection) {
    return (
      <>
        <Stack.Screen options={{ title: 'Collection Not Found' }} />
        <View className="flex-1 items-center justify-center">
          <Text>Collection not found</Text>
        </View>
      </>
    );
  }

  const handleDeleteCollection = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/inventory');
    }

    // Dispatch after navigation transition (increased timeout)
    setTimeout(() => {
      dispatch(deleteCollection(catalogId));
    }, 1000);
  };

  const handleAddItem = () => {
    // Basic validation: check required fields
    const isValid = collection.schema.every((field) => {
      if (field.required && !newValues[field.key]) return false;
      return true;
    });

    if (isValid) {
      dispatch(
        addItem({
          collectionId: catalogId,
          item: {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            values: { ...newValues },
          },
        })
      );
      setNewValues({});
      setIsAdding(false);
    } else {
      setErrorMessage('Please fill all required fields');
      setErrorDialogOpen(true);
    }
  };

  const updateValue = (key: string, value: string) => {
    setNewValues((prev) => ({ ...prev, [key]: value }));
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return collection.data;

    const query = searchQuery.toLowerCase();
    return collection.data.filter((item) => {
      // Search across all field values
      return collection.schema.some((field) => {
        const value = item.values[field.key];
        if (value === null || value === undefined) return false;

        // Convert value to string for searching
        const stringValue = value.toString().toLowerCase();
        return stringValue.includes(query);
      });
    });
  }, [collection.data, collection.schema, searchQuery]);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => <Text className="text-lg font-bold">{collection.name}</Text>,
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="-ml-2 p-2">
              <Icon as={ArrowLeft} size={24} className="text-foreground" />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => setIsAdding(!isAdding)} className="mr-0 p-2">
              <Icon as={Plus} size={24} className="text-foreground" />
            </Pressable>
          ),
        }}
      />
      <View className="flex-1 bg-background">
        {/* Search & Stats Section */}
        <View className="px-4 pb-2">
          <View className="mb-2 flex-row items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 dark:bg-muted">
            <Icon as={Search} size={18} className="text-muted-foreground" />
            <Input
              placeholder="Search model or SKU"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 border-0 bg-transparent p-0 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="mb-2 flex-row items-center justify-between px-1">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {filteredItems.length} ITEMS
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-[10px] font-medium text-muted-foreground">Synced 2m ago</Text>
            </View>
          </View>
        </View>

        {isAdding && (
          <Card>
            <CardHeader>
              <CardTitle>New Item</CardTitle>
            </CardHeader>
            <CardContent className="gap-4">
              {collection.schema.map((field) => (
                <DynamicFieldRenderer
                  key={field.key}
                  field={field}
                  value={newValues[field.key] ?? field.defaultValue}
                  onChange={(value) => updateValue(field.key, value)}
                />
              ))}
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline" onPress={() => setIsAdding(false)}>
                <Text>Cancel</Text>
              </Button>
              <Button onPress={handleAddItem}>
                <Text>Add</Text>
              </Button>
            </CardFooter>
          </Card>
        )}

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-4"
          renderItem={({ item, index }) => {
            // Assumption: 0=Name, 1=SKU, 2=Qty/Stock
            const fields = collection.schema;
            const mainField = fields[0]; // e.g. Name
            const subField = fields[1]; // e.g. SKU
            const statField =
              fields.find(
                (f) => f.type === 'number' || f.key.includes('qty') || f.key.includes('stock')
              ) || fields[2];

            const mainValue = item.values[mainField?.key] || 'Untitled';
            const subValue = subField ? item.values[subField.key] : '';
            const statValue = statField ? item.values[statField.key] : null;

            return (
              <Link href={`/inventory/${catalogId}/${item.id}`} asChild>
                <Pressable className="flex-row items-center justify-between border-b border-gray-100 bg-background px-4 py-4 active:bg-gray-50 dark:border-border dark:active:bg-muted/10">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-bold text-foreground">{mainValue}</Text>
                    {subValue ? (
                      <Text className="text-xs font-semibold uppercase text-muted-foreground/70">
                        {subField?.label}: {subValue}
                      </Text>
                    ) : null}
                  </View>

                  <View className="flex-row items-center gap-4">
                    {/* Status/Stat Block */}
                    <View className="items-end">
                      {statValue !== null && (
                        <Text className="text-xl font-bold text-foreground">{statValue}</Text>
                      )}
                      <View
                        className={`rounded px-1.5 py-0.5 ${Number(statValue) === 0 ? 'bg-muted' : 'bg-green-100 dark:bg-green-900'}`}>
                        <Text
                          className={`text-[9px] font-bold uppercase ${Number(statValue) === 0 ? 'text-muted-foreground' : 'text-green-700 dark:text-green-300'}`}>
                          {Number(statValue) === 0 ? 'EMPTY' : 'IN STOCK'}
                        </Text>
                      </View>
                    </View>

                    <Icon as={ChevronRight} size={16} className="text-gray-300" />
                  </View>
                </Pressable>
              </Link>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center p-8">
              <Text className="text-muted-foreground">No items in this collection.</Text>
            </View>
          }
        />

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

        {/* Delete Collection Alert Dialog */}
        <AlertDialog open={deleteCollectionOpen} onOpenChange={setDeleteCollectionOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Collection</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{collection.name}"? This will permanently delete
                all items in this collection. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <Text>Cancel</Text>
              </AlertDialogCancel>
              <AlertDialogAction onPress={handleDeleteCollection} className="bg-destructive">
                <Text className="text-destructive-foreground">Delete</Text>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </>
  );
}
