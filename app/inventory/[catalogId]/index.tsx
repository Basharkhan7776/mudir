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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteItem } from '@/lib/store/slices/inventorySlice';
import { RootState } from '@/lib/store';
import { Link, Stack, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Plus, Trash2, Settings, Search, ArrowLeft, ChevronRight } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { createStaggeredAnimation } from '@/lib/animations';
import { useDispatch, useSelector } from 'react-redux';
// Removed DynamicFieldRenderer import

const CatalogListItem = React.memo(
  ({
    item,
    catalogId,
    schema,
    isSelected,
    isSelectionMode,
    onPress,
    onLongPress,
    index,
  }: {
    item: any;
    catalogId: string;
    schema: any[];
    isSelected: boolean;
    isSelectionMode: boolean;
    onPress: (id: string) => void;
    onLongPress: (id: string) => void;
    index: number;
  }) => {
    // Assumption: 0=Name, 1=SKU
    const fields = schema;
    const mainField = fields[0]; // e.g. Name
    const subField = fields[1]; // e.g. SKU

    const mainValue = item.values[mainField?.key] || 'Untitled';
    const subValue = subField ? item.values[subField.key] : '';

    return (
      <Animated.View
        entering={createStaggeredAnimation(index - 2).withInitialValues({ opacity: 0 })}
        exiting={FadeOutUp.duration(200)}
        layout={LinearTransition.duration(300).damping(30)}
        className="mb-4 px-5">
        <Link href={`/inventory/${catalogId}/${item.id}`} asChild={!isSelectionMode}>
          <Pressable
            delayLongPress={200}
            onLongPress={() => onLongPress(item.id)}
            onPress={() => onPress(item.id)}
            disabled={isSelectionMode ? false : undefined}>
            <Card
              className={`w-full flex-row items-center rounded-2xl border-0 p-4 shadow-sm ${isSelected ? 'bg-secondary/30' : 'bg-card'}`}>
              <View className="mr-4 items-center justify-center">
                <View
                  className={`h-2 w-2 rounded-full ${isSelected ? 'scale-150 bg-blue-500' : 'bg-primary'}`}
                />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-lg font-bold text-foreground">{mainValue}</Text>
                {subValue ? (
                  <Text className="text-xs font-semibold uppercase text-muted-foreground/70">
                    {subField?.label}: {subValue}
                  </Text>
                ) : null}
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

  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelectionMode = selectedIds.size > 0;

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

  const listData = useMemo(() => {
    const data: any[] = [{ id: 'TITLE_HEADER' }, { id: 'SEARCH_HEADER' }];
    if (filteredItems.length === 0) {
      data.push({ id: 'EMPTY_STATE' });
    } else {
      data.push(...filteredItems);
    }
    return data;
  }, [filteredItems]);

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
        router.push(`/inventory/${catalogId}/${id}`);
      }
    },
    [isSelectionMode, toggleSelection, router, catalogId]
  );

  const handleBatchDelete = () => {
    selectedIds.forEach((id) => {
      dispatch(deleteItem({ collectionId: catalogId, itemId: id }));
    });
    setSelectedIds(new Set());
  };

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
                    onPress={() => {
                      if (isSelectionMode) {
                        setSelectedIds(new Set());
                      } else {
                        router.back();
                      }
                    }}
                    className="-ml-3 mt-1">
                    <Icon as={ArrowLeft} size={24} className="text-foreground" />
                  </Button>
                  <Text className="flex-1 text-center text-3xl font-bold text-foreground">
                    {collection.name}
                  </Text>
                  <View className="w-10" />
                </View>
              );
            }

            if (item.id === 'SEARCH_HEADER') {
              return (
                <View className="bg-background px-5 pb-6 pt-2">
                  <Input
                    placeholder="Search model or SKU"
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
                  <Text className="text-muted-foreground">No items in this collection.</Text>
                </View>
              );
            }

            const isSelected = selectedIds.has(item.id);

            return (
              <CatalogListItem
                key={item.id}
                item={item}
                catalogId={catalogId}
                schema={collection.schema}
                index={index}
                isSelected={isSelected}
                isSelectionMode={isSelectionMode}
                onPress={handlePress}
                onLongPress={handleLongPress}
              />
            );
          }}
        />

        {/* Floating Action Button */}

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          className="pointer-events-box-none absolute bottom-8 left-0 right-0 flex-row justify-end px-6">
          {/* Right Action Button (Plus or Delete) */}
          {isSelectionMode ? (
            <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    className="h-16 w-16 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                    <Icon as={Trash2} size={28} className="text-white dark:text-black" />
                  </TouchableOpacity>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Items</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} item
                      {selectedIds.size > 1 ? 's' : ''}?
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
          ) : (
            <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
              <Pressable
                onPress={() => {
                  router.push(`/inventory/${catalogId}/item-form`);
                }}
                className="h-16 w-16 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                <Icon as={Plus} size={32} className="text-white dark:text-black" />
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>

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
      </View>
    </>
  );
}
