import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { RootState } from '@/lib/store';
import { deleteCollection } from '@/lib/store/slices/inventorySlice';
import { Link, Stack, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Plus, Pencil } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
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
import { Trash2 } from 'lucide-react-native';

export default function InventoryScreen() {
  const collections = useSelector((state: RootState) => state.inventory.collections);
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelectionMode = selectedIds.size > 0;

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;

    const query = searchQuery.toLowerCase();
    return collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(query) ||
        collection.description?.toLowerCase().includes(query)
    );
  }, [collections, searchQuery]);

  const listData = useMemo(() => {
    const data: any[] = [{ id: 'TITLE_HEADER' }, { id: 'SEARCH_HEADER' }];
    if (filteredCollections.length === 0) {
      data.push({ id: 'EMPTY_STATE' });
    } else {
      data.push(...filteredCollections);
    }
    return data;
  }, [filteredCollections]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleLongPress = (id: string) => {
    if (!isSelectionMode) {
      setSelectedIds(new Set([id]));
    }
  };

  const handlePress = (id: string) => {
    if (isSelectionMode) {
      toggleSelection(id);
    } else {
      router.push(`/inventory/${id}`);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="relative flex-1 bg-background pt-12">
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
                    Collections
                  </Text>
                  <View className="w-10" />
                </View>
              );
            }

            if (item.id === 'SEARCH_HEADER') {
              return (
                <View className="bg-background px-5 pb-6 pt-2">
                  <Input
                    placeholder="Search collections..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="h-12 rounded-full border-0 bg-secondary/50 px-6"
                  />
                </View>
              );
            }

            if (item.id === 'EMPTY_STATE') {
              return (
                <Animated.View
                  className="items-center justify-center p-8"
                  entering={FadeInDown.delay(200).damping(30)}>
                  <Text className="text-muted-foreground">No collections found.</Text>
                </Animated.View>
              );
            }

            const isSelected = selectedIds.has(item.id);

            return (
              <Animated.View
                entering={createStaggeredAnimation(index - 2).withInitialValues({ opacity: 0 })}
                exiting={FadeOutUp.duration(200)}
                layout={LinearTransition.duration(300).damping(30)}
                className="mb-4 px-5">
                <Link href={`/inventory/${item.id}`} asChild={!isSelectionMode}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onLongPress={() => handleLongPress(item.id)}
                    onPress={() => handlePress(item.id)}
                    disabled={isSelectionMode ? false : undefined}>
                    <Card
                      className={`w-full flex-row items-center rounded-2xl border-0 p-4 shadow-sm ${isSelected ? 'bg-secondary/30' : 'bg-card'}`}>
                      <View className="mr-4 items-center justify-center">
                        <View
                          className={`h-2 w-2 rounded-full ${isSelected ? 'scale-150 bg-blue-500' : 'bg-primary'}`}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground">{item.name}</Text>
                        <Text className="text-muted-foreground">{item.data.length} items</Text>
                      </View>
                      {!isSelectionMode && (
                        <Icon
                          as={ChevronRight}
                          size={20}
                          className="text-gray-300 dark:text-gray-600"
                        />
                      )}
                    </Card>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
            );
          }}
        />

        {/* Floating Action Button */}

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          className="pointer-events-box-none absolute bottom-8 left-0 right-0 flex-row justify-between px-6">
          {/* Edit Button (Left) - Only when 1 item selected */}
          {isSelectionMode && selectedIds.size === 1 ? (
            <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  const id = Array.from(selectedIds)[0];
                  router.push(`/inventory/${id}/edit-schema` as any);
                }}
                className="h-16 w-16 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                <Icon as={Pencil} size={28} className="text-white dark:text-black" />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View />
          )}

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
                    <AlertDialogTitle>Delete Collections</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} collection
                      {selectedIds.size > 1 ? 's' : ''}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      <Text>Cancel</Text>
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onPress={() => {
                        selectedIds.forEach((id) => {
                          dispatch(deleteCollection(id));
                        });
                        setSelectedIds(new Set());
                      }}>
                      <Text>Delete</Text>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push('/inventory/schema-builder')}
                className="h-16 w-16 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
                <Icon as={Plus} size={32} className="text-white dark:text-black" />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    </>
  );
}
