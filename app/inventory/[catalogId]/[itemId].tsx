import React, { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { deleteItem, updateItem } from '@/lib/store/slices/inventorySlice';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Trash2, Edit, X, Check, Calendar, DollarSign, Hash, Type, List } from 'lucide-react-native';
import { DynamicFieldRenderer } from '@/components/inventory/DynamicFieldRenderer';

export default function ItemDetailScreen() {
  const { catalogId, itemId } = useLocalSearchParams<{ catalogId: string; itemId: string }>();
  const router = useRouter();
  const dispatch = useDispatch();

  const collection = useSelector((state: RootState) =>
    state.inventory.collections.find((c) => c.id === catalogId)
  );

  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);

  const item = collection?.data.find((i) => i.id === itemId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, any>>(item?.values || {});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  if (!collection || !item) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Item not found</Text>
      </View>
    );
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    dispatch(deleteItem({ collectionId: catalogId, itemId }));
    setDeleteDialogOpen(false);
    router.back();
  };

  const handleSave = () => {
    // Validate required fields
    const isValid = collection.schema.every(field => {
      if (field.required && !editedValues[field.key]) return false;
      return true;
    });

    if (!isValid) {
      setErrorMessage('Please fill all required fields');
      setErrorDialogOpen(true);
      return;
    }

    dispatch(updateItem({
      collectionId: catalogId,
      itemId,
      updates: editedValues
    }));

    setIsEditing(false);
    setSuccessDialogOpen(true);
  };

  const handleCancel = () => {
    setEditedValues(item?.values || {});
    setIsEditing(false);
  };

  const updateValue = (key: string, value: any) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const formatValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return 'N/A';

    switch (fieldType) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'currency':
        return `${currencySymbol}${value}`;
      default:
        return value.toString();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Item Details',
          headerShown: true,
          headerRight: () => (
            <Pressable
              onPress={() => setIsEditing(!isEditing)}
              style={{ padding: 8, marginRight: 8 }}
            >
              {isEditing ? (
                <Icon as={X} size={24} className="text-foreground" />
              ) : (
                <Icon as={Edit} size={22} className="text-foreground" />
              )}
            </Pressable>
          )
        }}
      />
      <ScrollView className="flex-1" contentContainerClassName="p-4 gap-4">
        {/* Main Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {(isEditing ? editedValues : item.values)[collection.schema[0]?.key] || 'Untitled Item'}
            </CardTitle>
            <Text className="text-sm text-muted-foreground">
              Created: {new Date(item.createdAt).toLocaleString()}
            </Text>
          </CardHeader>
        </Card>

        {/* All Fields */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Details' : 'Details'}</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            {isEditing ? (
              // Edit mode: show dynamic field renderers
              collection.schema.map((field) => (
                <DynamicFieldRenderer
                  key={field.key}
                  field={field}
                  value={editedValues[field.key] ?? field.defaultValue}
                  onChange={(value) => updateValue(field.key, value)}
                />
              ))
            ) : (
              // View mode: show formatted values
              collection.schema.map((field) => {
                let DisplayIcon = Type;
                let displayValue = formatValue(item.values[field.key], field.type);
                let valueClass = "text-base font-medium";

                switch (field.type) {
                  case 'currency':
                    DisplayIcon = DollarSign;
                    valueClass = "text-lg font-bold text-primary";
                    break;
                  case 'number':
                    DisplayIcon = Hash;
                    break;
                  case 'date':
                    DisplayIcon = Calendar;
                    break;
                  case 'select':
                    DisplayIcon = List;
                    break;
                  case 'boolean':
                    DisplayIcon = item.values[field.key] ? Check : X;
                    displayValue = item.values[field.key] ? 'Yes, Active' : 'No, Inactive';
                    valueClass = item.values[field.key] ? "text-green-600 font-medium" : "text-muted-foreground";
                    break;
                }

                return (
                  <View key={field.key} className="flex-row items-center p-3 bg-muted/5 rounded-xl border border-border/40">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-background border border-border/60 mr-4 shadow-sm">
                      <Icon as={DisplayIcon} size={18} className="text-muted-foreground" />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {field.label}
                      </Text>
                      <Text className={valueClass}>
                        {displayValue}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="flex-row gap-2">
              <Button variant="outline" className="flex-1" onPress={handleCancel}>
                <Text>Cancel</Text>
              </Button>
              <Button className="flex-1" onPress={handleSave}>
                <Icon as={Check} size={18} className="text-primary-foreground mr-2" />
                <Text>Save</Text>
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Actions */}
        {!isEditing && (
          <Button
            variant="destructive"
            onPress={handleDelete}
            className="flex-row items-center justify-center gap-2"
          >
            <Icon as={Trash2} size={20} className="text-destructive-foreground" />
            <Text className="text-destructive-foreground">Delete Item</Text>
          </Button>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  <Text>Cancel</Text>
                </Button>
              </DialogClose>
              <Button variant="destructive" onPress={confirmDelete}>
                <Text className="text-destructive-foreground">Delete</Text>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Error Dialog */}
        <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>
                {errorMessage}
              </DialogDescription>
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

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Success</DialogTitle>
              <DialogDescription>
                Item updated successfully
              </DialogDescription>
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
      </ScrollView>
    </>
  );
}
