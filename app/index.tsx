import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Link, Stack, useRouter } from 'expo-router';
import { ArrowRight, Box, CreditCard, Search, Settings } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, ScrollView, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { createStaggeredAnimation } from '@/lib/animations';
import { Icon } from '@/components/ui/icon';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { completeOnboarding } from '@/lib/store/slices/settingsSlice';
import { SearchModal } from '@/components/search-modal';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [searchOpen, setSearchOpen] = useState(false);
  const isNewUser = useSelector((state: RootState) => state.settings.isNewUser);
  const collections = useSelector((state: RootState) => state.inventory.collections);
  const ledgerEntries = useSelector((state: RootState) => state.ledger.entries);
  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);

  const totalItems = collections.reduce((acc, c) => acc + c.data.length, 0);
  const totalLedgerBalance = ledgerEntries.reduce((acc, entry) => {
    return (
      acc +
      entry.transactions.reduce(
        (tAcc, t) => (t.type === 'CREDIT' ? tAcc - t.amount : tAcc + t.amount),
        0
      )
    );
  }, 0);

  // Silently complete onboarding
  React.useEffect(() => {
    if (isNewUser) {
      dispatch(completeOnboarding());
    }
  }, [isNewUser]);

  const formatBalance = (amount: number) => {
    if (Math.abs(amount) >= 1000) {
      return (amount / 1000).toFixed(1) + 'k';
    }
    return amount.toString();
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerClassName="p-5 gap-6"
        style={{ paddingTop: insets.top }}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          className="mb-2 flex-row items-center justify-between py-2"
          entering={Platform.OS !== 'web' ? FadeInUp.duration(400).damping(30) : undefined}>
          <Text className="text-4xl font-black tracking-tight text-foreground">Mudir</Text>
          <TouchableOpacity onPress={() => setSearchOpen(true)} className="p-2">
            <Icon as={Search} size={24} className="text-foreground" />
          </TouchableOpacity>
        </Animated.View>

        <View className="gap-5">
          {/* Inventory Card */}
          <Animated.View
            entering={Platform.OS !== 'web' ? createStaggeredAnimation(0, FadeInDown) : undefined}>
            <Link href="/inventory" asChild>
              <TouchableOpacity activeOpacity={0.9}>
                <Card className="h-64 w-full justify-between overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
                  <CardContent className="h-full justify-between p-6">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row items-center gap-2">
                        <Icon as={Box} size={20} className="text-muted-foreground" />
                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Inventory
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text className="-ml-1 text-6xl font-black tracking-tighter text-foreground">
                        {totalItems.toLocaleString()}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
                      <Text className="text-lg font-semibold text-foreground">
                        Manage Collections
                      </Text>
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-black dark:bg-white">
                        <Icon as={ArrowRight} size={20} className="text-white dark:text-black" />
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            </Link>
          </Animated.View>

          {/* Ledger Card */}
          <Animated.View
            entering={Platform.OS !== 'web' ? createStaggeredAnimation(1, FadeInDown) : undefined}>
            <Link href="/ledger" asChild>
              <TouchableOpacity activeOpacity={0.9}>
                <Card className="h-64 w-full justify-between overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
                  <CardContent className="h-full justify-between p-6">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row items-center gap-2">
                        <Icon as={CreditCard} size={20} className="text-muted-foreground" />
                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Ledger
                        </Text>
                      </View>
                    </View>

                    <View>
                      <Text
                        className="-ml-1 text-6xl font-black tracking-tighter text-foreground"
                        numberOfLines={1}
                        adjustsFontSizeToFit>
                        {currencySymbol}
                        {formatBalance(totalLedgerBalance)}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
                      <Text className="text-lg font-semibold text-foreground">
                        Track Organizations
                      </Text>
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-black dark:bg-white">
                        <Icon as={ArrowRight} size={20} className="text-white dark:text-black" />
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            </Link>
          </Animated.View>

          {/* Settings Card */}
          <Animated.View
            entering={Platform.OS !== 'web' ? createStaggeredAnimation(2, FadeInDown) : undefined}>
            <Link href="/settings" asChild>
              <TouchableOpacity activeOpacity={0.9}>
                <Card className="h-64 w-full justify-between overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
                  <CardContent className="h-full justify-between p-6">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-row items-center gap-2">
                        <Icon as={Settings} size={20} className="text-muted-foreground" />
                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          System
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-4">
                      <Text className="text-5xl font-black tracking-tighter text-foreground">
                        Settings
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
                      <Text className="text-lg font-semibold text-foreground">
                        App Config & Data
                      </Text>
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800">
                        <Icon as={ArrowRight} size={20} className="text-foreground" />
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </View>
        <View className="h-10" />
      </ScrollView>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
