import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
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
  addTransaction,
  updateOrganization,
  deleteOrganization,
} from '@/lib/store/slices/ledgerSlice';
import { RootState } from '@/lib/store';
import { Stack, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { ArrowLeft, Printer, MoreVertical, Edit, Trash2 } from 'lucide-react-native';
import React, { useState, useMemo, useRef } from 'react';
import {
  FlatList,
  View,
  Pressable,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useColorScheme } from 'nativewind';
import { generateLedgerPDF } from '@/lib/pdfGenerator';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function PartyScreen() {
  const { partyId } = useLocalSearchParams<{ partyId: string }>();
  const router = useRouter();
  const entryStore = useSelector((state: RootState) =>
    state.ledger.entries.find((e) => e.organization.id === partyId)
  );
  // Local cache to keep data alive during deletion animation
  const [entry, setEntry] = useState(entryStore);

  React.useEffect(() => {
    if (entryStore) {
      setEntry(entryStore);
    }
  }, [entryStore]);

  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
  const orgName = useSelector((state: RootState) => state.settings.organizationName);
  const dispatch = useDispatch();
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();

  const [isPrintingPDF, setIsPrintingPDF] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Dialogs
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [editedOrgName, setEditedOrgName] = useState(entry?.organization?.name ?? '');
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Scroll ref
  const flatListRef = useRef<FlatList>(null);

  if (!entry) return null;

  const netBalance = useMemo(() => {
    return entry.transactions.reduce((acc, t) => {
      return t.type === 'CREDIT' ? acc - t.amount : acc + t.amount;
    }, 0);
  }, [entry.transactions]);

  const groupedTransactions = useMemo(() => {
    const sorted = [...entry.transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const groups: { title: string; data: typeof sorted }[] = [];

    sorted.forEach((txn) => {
      const date = new Date(txn.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let title = date.toLocaleDateString();
      if (date.toDateString() === today.toDateString()) title = 'Today';
      else if (date.toDateString() === yesterday.toDateString()) title = 'Yesterday';

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.title === title) {
        lastGroup.data.push(txn);
      } else {
        groups.push({ title, data: [txn] });
      }
    });
    return groups;
  }, [entry.transactions]);

  // Flatten for FlatList
  const flatListData = useMemo(() => {
    const data: any[] = [];
    groupedTransactions.forEach((group) => {
      data.push({ type: 'header', title: group.title, id: `header-${group.title}` });
      group.data.forEach((txn) => data.push({ ...txn }));
    });
    return data; // Reverse order not needed as we map chronologically for chat interface? Usually chat is bottom-up.
    // Let's stick to top-down for now like the mockup (Latest at bottom?)
    // Mockup shows "Yesterday" then "Today" below it. So chronological top-down.
  }, [groupedTransactions]);

  const handleTransaction = (type: 'CREDIT' | 'DEBIT') => {
    if (amount && !isNaN(parseFloat(amount))) {
      dispatch(
        addTransaction({
          organizationId: partyId,
          transaction: {
            id: Date.now().toString(),
            organizationId: partyId,
            type,
            amount: parseFloat(amount),
            date: new Date().toISOString(),
            remark: description.trim(),
          },
        })
      );
      setAmount('');
      setDescription('');
      // Scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleDeleteOrg = () => {
    if (navigation.canGoBack()) router.back();
    else router.replace('/ledger');
    setTimeout(() => dispatch(deleteOrganization(partyId)), 1000);
  };

  const handleSaveOrganization = () => {
    if (!editedOrgName.trim()) return;
    dispatch(
      updateOrganization({
        organizationId: partyId,
        updates: { name: editedOrgName.trim() },
      })
    );
    setIsEditingOrg(false);
  };

  const handlePrintPDF = async () => {
    try {
      setIsPrintingPDF(true);
      await generateLedgerPDF(
        entry.organization,
        entry.transactions,
        currencySymbol,
        orgName || 'Mudir'
      );
      setSuccessMessage('PDF generated successfully!');
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPrintingPDF(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-background pt-12">
        {/* Header */}
        <View className="z-10 flex-row items-center justify-between border-b border-border bg-card px-5 pb-6">
          <Button variant="ghost" size="icon" onPress={() => router.back()} className="-ml-2">
            <Icon as={ArrowLeft} size={24} className="text-foreground" />
          </Button>
          <View className="items-center">
            <Text className="text-lg font-bold text-foreground">{entry.organization.name}</Text>
            <Text className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Net Balance
            </Text>
            <Text className="mt-1 text-3xl font-black text-foreground">
              {currencySymbol}{' '}
              {Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <View
              className={`mt-1 rounded-full px-2 py-0.5 ${netBalance > 0 ? 'bg-green-100 dark:bg-green-900' : netBalance < 0 ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100'}`}>
              <Text
                className={`text-[10px] font-bold ${netBalance > 0 ? 'text-green-700 dark:text-green-300' : netBalance < 0 ? 'text-red-700 dark:text-red-300' : 'text-gray-500'}`}>
                {netBalance > 0 ? 'YOU WILL GET' : netBalance < 0 ? 'YOU WILL GIVE' : 'SETTLED'}
              </Text>
            </View>
          </View>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {isPrintingPDF ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Icon as={MoreVertical} size={24} className="text-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onPress={handlePrintPDF}>
                <Icon as={Printer} size={16} className="mr-2 text-foreground" />
                <Text>Save PDF</Text>
              </DropdownMenuItem>
              <DropdownMenuItem onPress={() => setIsEditingOrg(true)}>
                <Icon as={Edit} size={16} className="mr-2 text-foreground" />
                <Text>Edit Name</Text>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onPress={() => setDeleteOrgOpen(true)}>
                <Icon as={Trash2} size={16} className="mr-2 text-destructive" />
                <Text className="text-destructive">Delete Party</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          className="flex-1">
          <FlatList
            ref={flatListRef}
            data={flatListData}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4 pb-24"
            contentContainerStyle={{ flexGrow: 1 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <View className="my-4 items-center">
                    <View className="rounded-full bg-muted px-3 py-1">
                      <Text className="text-xs font-semibold text-muted-foreground">
                        {item.title}
                      </Text>
                    </View>
                  </View>
                );
              }

              // Transaction Item (DEBIT = LEFT/Received?, CREDIT = RIGHT/Paid?)
              // Logic check:
              // DEBIT usually means "You Gave" in this app context (from previous code: You Took (Debit)).
              // Wait, "You Took (Debit)" means I owe them (Liability).
              // "You Gave (Credit)" means they owe me (Asset).
              // Let's align with the mockup:
              // Left side: Light Gray bubble. Right side: Black bubble.
              // Usually Right side is "Me" (User). Left side is "Them".

              // Let's assume:
              // CREDIT (You Gave) -> Asset -> Right Side (Black Bubble)
              // DEBIT (You Took) -> Liability -> Left Side (Gray Bubble)

              const isCredit = item.type === 'CREDIT';

              return (
                <Animated.View
                  entering={FadeInUp.duration(300)}
                  className={`mb-3 flex-row ${isCredit ? 'justify-end' : 'justify-start'}`}>
                  <View
                    className={`max-w-[80%] px-5 py-3 shadow-sm ${
                      isCredit
                        ? 'rounded-[28px] rounded-tr-none bg-black'
                        : 'rounded-[28px] rounded-tl-none bg-gray-100'
                    }`}>
                    {item.remark ? (
                      <Text
                        className={`mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60 ${isCredit ? 'text-white' : 'text-black'}`}>
                        {item.remark}
                      </Text>
                    ) : null}
                    <Text
                      className={`text-2xl font-black ${isCredit ? 'text-white' : 'text-black'}`}>
                      {isCredit ? '+' : '-'} {currencySymbol}
                      {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                </Animated.View>
              );
            }}
          />

          {/* Footer Input Area */}
          <View className="border-t border-border bg-card p-4">
            <View className="mb-4 flex-row gap-4">
              {/* Amount Input */}
              <View className="flex-[1.2] justify-center rounded-2xl bg-muted px-4 py-3">
                <Text className="mb-1 text-[10px] font-bold tracking-widest text-muted-foreground opacity-70">
                  AMOUNT
                </Text>
                <View className="flex-row items-center">
                  <Text className="mr-1 text-lg font-bold text-muted-foreground">
                    {currencySymbol}
                  </Text>
                  <Input
                    className="h-8 flex-1 border-0 bg-transparent p-0 text-xl font-bold leading-tight"
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                </View>
              </View>

              {/* Description Input */}
              <View className="flex-[1.8] justify-center rounded-2xl bg-muted px-4 py-3">
                <Input
                  className="h-14 border-0 bg-transparent p-0 text-base leading-tight"
                  placeholder="Add description..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="center"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="mb-2 h-14 flex-row gap-4">
              <Pressable
                onPress={() => handleTransaction('DEBIT')}
                className="flex-1 items-center justify-center rounded-full border border-border bg-white shadow-sm active:scale-95">
                <Text className="text-lg font-bold text-black">DEBIT (-)</Text>
              </Pressable>
              <Pressable
                onPress={() => handleTransaction('CREDIT')}
                className="flex-1 items-center justify-center rounded-full bg-black shadow-sm active:scale-95">
                <Text className="text-lg font-bold text-white">CREDIT (+)</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Edit Organization Dialog */}
        <Dialog open={isEditingOrg} onOpenChange={setIsEditingOrg}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Name</DialogTitle>
            </DialogHeader>
            <Input value={editedOrgName} onChangeText={setEditedOrgName} />
            <DialogFooter>
              <Button onPress={handleSaveOrganization}>
                <Text>Save</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteOrgOpen} onOpenChange={setDeleteOrgOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Party?</DialogTitle>
              <DialogDescription>This cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onPress={() => setDeleteOrgOpen(false)}>
                <Text>Cancel</Text>
              </Button>
              <Button variant="destructive" onPress={handleDeleteOrg}>
                <Text>Delete</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Success</DialogTitle>
              <DialogDescription>{successMessage}</DialogDescription>
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
