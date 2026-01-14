import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { RootState } from '@/lib/store';
import { deleteCollection } from '@/lib/store/slices/inventorySlice';
import { Link, Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  Disc,
  Headphones,
  Laptop,
  Plus,
  Search,
  Smartphone,
  Cable,
} from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Pressable, Alert, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Animated, { FadeInDown, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { createStaggeredAnimation } from '@/lib/animations';
import { CollapsingHeaderFlatList } from '@/components/CollapsingHeaderFlatList';

export default function InventoryScreen() {
  const collections = useSelector((state: RootState) => state.inventory.collections);
  const dispatch = useDispatch();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;

    const query = searchQuery.toLowerCase();
    return collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(query) ||
        collection.description?.toLowerCase().includes(query)
    );
  }, [collections, searchQuery]);

  const getIconForCollection = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('mobile') || lowerName.includes('phone')) return Smartphone;
    if (lowerName.includes('laptop') || lowerName.includes('computer')) return Laptop;
    if (lowerName.includes('headphone') || lowerName.includes('music')) return Headphones;
    if (lowerName.includes('cable') || lowerName.includes('wire')) return Cable;
    if (lowerName.includes('disk') || lowerName.includes('storage')) return Disc;
    return Smartphone; // Default
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="relative flex-1 bg-background pt-12">
        <View className="z-10 px-5 pb-6">
          <Button variant="ghost" size="icon" onPress={() => router.back()} className="-ml-3">
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </Button>
        </View>
        <CollapsingHeaderFlatList
          title="Collections"
          subtitle=""
          data={filteredCollections}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-5 pb-24 gap-4"
          listHeaderComponent={
            <View className="px-5 pb-4">
              <View className="mb-6 flex-row items-center justify-between">
                <Text className="text-4xl font-black tracking-tight text-foreground">
                  Collections
                </Text>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Icon as={Search} size={24} className="text-foreground" />
                </Button>
              </View>
            </View>
          }
          renderItem={({ item, index }) => {
            const CollectionIcon = getIconForCollection(item.name);
            return (
              <Animated.View
                entering={createStaggeredAnimation(index).withInitialValues({ opacity: 0 })}
                exiting={FadeOutUp.duration(200)}
                layout={LinearTransition.duration(300).damping(30)}>
                <Link href={`/inventory/${item.id}`} asChild>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Card className="w-full flex-row items-center rounded-2xl border-0 bg-card p-4 shadow-sm">
                      <View className="mr-4 h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-muted">
                        <Icon
                          as={CollectionIcon}
                          size={24}
                          className="text-gray-500 dark:text-gray-400"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground">{item.name}</Text>
                        <Text className="text-muted-foreground">{item.data.length} items</Text>
                      </View>
                      <Icon
                        as={ChevronRight}
                        size={20}
                        className="text-gray-300 dark:text-gray-600"
                      />
                    </Card>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <Animated.View
              className="items-center justify-center p-8"
              entering={FadeInDown.delay(200).damping(30)}>
              <Text className="text-muted-foreground">No collections found.</Text>
            </Animated.View>
          }
        />

        {/* Floating Action Button */}
        <Animated.View entering={FadeInDown.delay(500)} className="absolute bottom-8 right-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/inventory/schema-builder')}
            className="h-16 w-16 items-center justify-center rounded-full bg-black shadow-lg dark:bg-white">
            <Icon as={Plus} size={32} className="text-white dark:text-black" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}
