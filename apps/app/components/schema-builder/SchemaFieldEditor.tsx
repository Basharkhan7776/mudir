import React, { useState } from 'react';
import { View } from 'react-native';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { SchemaField, SchemaFieldType } from '@/lib/types';
import { Trash2, Plus } from 'lucide-react-native';
import { Icon } from '../ui/icon';

interface SchemaFieldEditorProps {
  field: SchemaField;
  onChange: (field: SchemaField) => void;
  onDelete: () => void;
}

const FIELD_TYPES: { value: SchemaFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'boolean', label: 'Yes/No' },
];

export function SchemaFieldEditor({ field, onChange, onDelete }: SchemaFieldEditorProps) {
  const [newOption, setNewOption] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const updateField = (updates: Partial<SchemaField>) => {
    onChange({ ...field, ...updates });
  };

  const addOption = () => {
    if (newOption.trim()) {
      const options = field.options || [];
      if (!options.includes(newOption.trim())) {
        updateField({ options: [...options, newOption.trim()] });
        setNewOption('');
      } else {
        setErrorDialogOpen(true);
      }
    }
  };

  const removeOption = (option: string) => {
    const options = field.options?.filter((o) => o !== option) || [];
    updateField({ options });
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex-row justify-between items-center">
        <CardTitle className="text-lg">Field Configuration</CardTitle>
        <Button variant="ghost" size="icon" onPress={onDelete}>
          <Icon as={Trash2} size={24} className="text-destructive" />
        </Button>
      </CardHeader>
      <CardContent className="gap-4">
        {/* Field Type */}
        <View className="gap-2">
          <Text className="text-sm font-medium">Field Type</Text>
          <Select
            value={{ value: field.type, label: FIELD_TYPES.find((t) => t.value === field.type)?.label || field.type }}
            onValueChange={(option) => updateField({ type: option?.value as SchemaFieldType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} label={type.label} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </View>

        {/* Field Key */}
        <View className="gap-2">
          <Text className="text-sm font-medium">Field Key (Internal name)</Text>
          <Input
            placeholder="e.g., model_name"
            value={field.key}
            onChangeText={(text) => updateField({ key: text.toLowerCase().replace(/\s+/g, '_') })}
          />
        </View>

        {/* Field Label */}
        <View className="gap-2">
          <Text className="text-sm font-medium">Field Label (Display name)</Text>
          <Input
            placeholder="e.g., Model Name"
            value={field.label}
            onChangeText={(text) => updateField({ label: text })}
          />
        </View>

        {/* Required Toggle */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium">Required Field</Text>
          <Switch
            checked={field.required || false}
            onCheckedChange={(checked) => updateField({ required: checked })}
          />
        </View>

        {/* Default Value (for non-select fields) */}
        {field.type !== 'select' && field.type !== 'boolean' && (
          <View className="gap-2">
            <Text className="text-sm font-medium">Default Value (Optional)</Text>
            <Input
              placeholder="Default value"
              value={field.defaultValue?.toString() || ''}
              onChangeText={(text) => updateField({ defaultValue: text })}
              keyboardType={field.type === 'number' || field.type === 'currency' ? 'numeric' : 'default'}
            />
          </View>
        )}

        {/* Boolean Default */}
        {field.type === 'boolean' && (
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium">Default Value</Text>
            <Switch
              checked={field.defaultValue === true}
              onCheckedChange={(checked) => updateField({ defaultValue: checked })}
            />
          </View>
        )}

        {/* Options (for select type) */}
        {field.type === 'select' && (
          <View className="gap-2">
            <Text className="text-sm font-medium">Dropdown Options</Text>
            {field.options?.map((option) => (
              <View key={option} className="flex-row items-center gap-2">
                <Text className="flex-1 p-2 border border-border rounded-lg">{option}</Text>
                <Button variant="ghost" size="icon" onPress={() => removeOption(option)}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </View>
            ))}
            <View className="flex-row gap-2">
              <Input
                placeholder="Add option"
                value={newOption}
                onChangeText={setNewOption}
                className="flex-1"
                onSubmitEditing={addOption}
              />
              <Button onPress={addOption}>
                <Plus size={20} className="text-primary-foreground" />
              </Button>
            </View>
          </View>
        )}
      </CardContent>

      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Option</DialogTitle>
            <DialogDescription>
              This option already exists
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
    </Card>
  );
}
