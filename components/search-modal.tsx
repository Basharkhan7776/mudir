import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Modal,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Search, X } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useRouter } from 'expo-router';
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  searchCollections,
  searchItems,
  searchOrganizations,
  searchLedgers,
  SearchResult,
} from './fuzzy-search';

type SearchResultType = 'collection' | 'item' | 'organization' | 'ledger';

interface SearchResultFormatted {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  collectionId?: string;
  collectionName?: string;
}

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function SearchModal({ open, onOpenChange }: SearchModalProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const collections = useSelector((state: RootState) => state.inventory.collections);
  const ledgerEntries = useSelector((state: RootState) => state.ledger.entries);

  useEffect(() => {
    if (!open) {
      setQuery('');
    }
  }, [open]);

  const results = useMemo((): {
    collections: SearchResultFormatted[];
    items: SearchResultFormatted[];
    organizations: SearchResultFormatted[];
    ledgers: SearchResultFormatted[];
  } => {
    if (!query.trim() || query.length < 2) {
      return { collections: [], items: [], organizations: [], ledgers: [] };
    }

    const collectionResults = searchCollections(
      collections.map((c) => ({ id: c.id, name: c.name, description: c.description })),
      query
    );

    const itemResults = searchItems(collections, query);

    const orgResults = searchOrganizations(
      ledgerEntries.map((e) => e.organization),
      query
    );

    const ledgerResults = searchLedgers(ledgerEntries, query);

    const formatResults = (res: SearchResult[]): SearchResultFormatted[] => {
      return res.map((r) => ({
        id: String(r.item.id),
        type: r.type,
        title: String(r.item.name || ''),
        subtitle: r.item.description ? String(r.item.description) : undefined,
      }));
    };

    const formatItemResults = (res: SearchResult[]): SearchResultFormatted[] => {
      return res.map((r) => {
        const values = r.item.values as Record<string, unknown>;
        const firstValue = Object.values(values).find((v) => v !== null && v !== undefined);
        return {
          id: String(r.item.id),
          type: r.type,
          title: firstValue ? String(firstValue) : 'Item',
          subtitle: r.item.collectionName ? `in ${String(r.item.collectionName)}` : undefined,
          collectionId: r.item.collectionId ? String(r.item.collectionId) : undefined,
          collectionName: r.item.collectionName ? String(r.item.collectionName) : undefined,
        };
      });
    };

    const formatOrgResults = (res: SearchResult[]): SearchResultFormatted[] => {
      return res.map((r) => ({
        id: String(r.item.id),
        type: r.type,
        title: String(r.item.name || ''),
        subtitle: r.item.phone
          ? String(r.item.phone)
          : r.item.email
            ? String(r.item.email)
            : undefined,
      }));
    };

    const formatLedgerResults = (res: SearchResult[]): SearchResultFormatted[] => {
      return res.map((r) => ({
        id: String(r.item.organizationId),
        type: r.type,
        title: String(r.item.organizationName || ''),
        subtitle: 'Ledger',
      }));
    };

    return {
      collections: formatResults(collectionResults),
      items: formatItemResults(itemResults),
      organizations: formatOrgResults(orgResults),
      ledgers: formatLedgerResults(ledgerResults),
    };
  }, [query, collections, ledgerEntries]);

  const handleSelect = (result: SearchResultFormatted) => {
    Keyboard.dismiss();
    onOpenChange(false);
    setQuery('');

    switch (result.type) {
      case 'collection':
        router.push(`/inventory/${result.id}`);
        break;
      case 'item':
        if (result.collectionId) {
          router.push(`/inventory/${result.collectionId}/${result.id}`);
        }
        break;
      case 'organization':
      case 'ledger':
        router.push(`/ledger/${result.id}`);
        break;
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onOpenChange(false);
  };

  const allResults = [
    ...results.collections,
    ...results.items,
    ...results.organizations,
    ...results.ledgers,
  ];
  const hasResults = allResults.length > 0;

  const getCircleColor = (type: SearchResultType) => {
    return 'bg-zinc-100 dark:bg-zinc-800';
  };

  const getCircleTextColor = (type: SearchResultType) => {
    return 'text-zinc-800 dark:text-zinc-200';
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={handleClose}>
      <View className="flex-1">
        <Pressable className="absolute inset-0 bg-black/50" onPress={handleClose} />

        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          className="mx-4 mt-[60px] overflow-hidden rounded-2xl bg-background shadow-xl"
          style={{ maxHeight: SCREEN_HEIGHT * 0.85 }}>
          <View className="flex-row items-center gap-3 border-b border-border p-4">
            <Icon as={Search} size={22} className="text-muted-foreground" />
            <Input
              className="flex-1 border-0 bg-transparent p-0 text-base text-foreground placeholder:text-muted-foreground"
              placeholder="Search collections, items, organizations..."
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
              placeholderTextColor="#a1a1aa"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={() => setQuery('')} className="p-1">
                <Icon as={X} size={20} className="text-muted-foreground" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleClose} className="p-1">
                <Icon as={X} size={22} className="text-muted-foreground" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            className="max-h-[60vh]"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {query.length > 0 && query.length < 2 && (
              <View className="p-6">
                <Text className="text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search
                </Text>
              </View>
            )}

            {query.length >= 2 && !hasResults && (
              <View className="p-6">
                <Text className="text-center text-sm text-muted-foreground">
                  No results found for "{query}"
                </Text>
              </View>
            )}

            {hasResults && (
              <View className="gap-1 p-2">
                {results.collections.length > 0 && (
                  <View className="mb-3">
                    <Text className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                      Collections
                    </Text>
                    {results.collections.map((result) => (
                      <TouchableOpacity
                        key={`collection-${result.id}`}
                        className="flex-row items-center gap-3 px-3 py-3 active:bg-accent"
                        onPress={() => handleSelect(result)}>
                        <View
                          className={`h-8 w-8 items-center justify-center rounded-full ${getCircleColor('collection')}`}>
                          <Text className={`text-sm font-bold ${getCircleTextColor('collection')}`}>
                            C
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium text-foreground">{result.title}</Text>
                          {result.subtitle && (
                            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                              {result.subtitle}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {results.items.length > 0 && (
                  <View className="mb-3">
                    <Text className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                      Items
                    </Text>
                    {results.items.map((result) => (
                      <TouchableOpacity
                        key={`item-${result.id}`}
                        className="flex-row items-center gap-3 px-3 py-3 active:bg-accent"
                        onPress={() => handleSelect(result)}>
                        <View
                          className={`h-8 w-8 items-center justify-center rounded-full ${getCircleColor('item')}`}>
                          <Text className={`text-sm font-bold ${getCircleTextColor('item')}`}>
                            I
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium text-foreground">{result.title}</Text>
                          {result.subtitle && (
                            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                              {result.subtitle}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {results.organizations.length > 0 && (
                  <View className="mb-3">
                    <Text className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                      Organizations
                    </Text>
                    {results.organizations.map((result) => (
                      <TouchableOpacity
                        key={`organization-${result.id}`}
                        className="flex-row items-center gap-3 px-3 py-3 active:bg-accent"
                        onPress={() => handleSelect(result)}>
                        <View
                          className={`h-8 w-8 items-center justify-center rounded-full ${getCircleColor('organization')}`}>
                          <Text
                            className={`text-sm font-bold ${getCircleTextColor('organization')}`}>
                            O
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium text-foreground">{result.title}</Text>
                          {result.subtitle && (
                            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                              {result.subtitle}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {results.ledgers.length > 0 && (
                  <View className="mb-3">
                    <Text className="px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                      Ledgers
                    </Text>
                    {results.ledgers.map((result) => (
                      <TouchableOpacity
                        key={`ledger-${result.id}`}
                        className="flex-row items-center gap-3 px-3 py-3 active:bg-accent"
                        onPress={() => handleSelect(result)}>
                        <View
                          className={`h-8 w-8 items-center justify-center rounded-full ${getCircleColor('ledger')}`}>
                          <Text className={`text-sm font-bold ${getCircleTextColor('ledger')}`}>
                            L
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className="font-medium text-foreground">{result.title}</Text>
                          {result.subtitle && (
                            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                              {result.subtitle}
                            </Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View className="h-6" />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
