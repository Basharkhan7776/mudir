import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchemaField } from '@/lib/types';
import { RootState } from '@/lib/store';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Calendar, Hash, Type, List } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { cn } from '@/lib/utils';

interface DynamicFieldRendererProps {
  field: SchemaField;
  value: any;
  onChange: (value: any) => void;
}

export function DynamicFieldRenderer({ field, value, onChange }: DynamicFieldRendererProps) {
  const currencySymbol = useSelector((state: RootState) => state.settings.userCurrency);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const Label = () => (
    <Text className="text-sm font-medium text-muted-foreground mb-1.5 ml-1">
      {field.label}
      {field.required && <Text className="text-destructive"> *</Text>}
    </Text>
  );

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <View>
            <Label />
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Icon as={Type} size={16} className="text-muted-foreground" />
              </View>
              <Input
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={value?.toString() || ''}
                onChangeText={onChange}
                className="pl-10 h-12 bg-muted/5 border-border/60 focus:border-primary focus:bg-background transition-all"
              />
            </View>
          </View>
        );

      case 'number':
        return (
          <View>
            <Label />
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Icon as={Hash} size={16} className="text-muted-foreground" />
              </View>
              <Input
                placeholder="0"
                value={value?.toString() || ''}
                onChangeText={onChange}
                keyboardType="numeric"
                className="pl-10 h-12 bg-muted/5 border-border/60 focus:border-primary focus:bg-background transition-all"
              />
            </View>
          </View>
        );

      case 'currency':
        return (
          <View>
            <Label />
            <View className="relative">
              <View className="absolute left-3 top-3.5 z-10">
                <Text className="text-muted-foreground font-medium text-base">{currencySymbol}</Text>
              </View>
              <Input
                placeholder="0.00"
                value={value?.toString() || ''}
                onChangeText={onChange}
                keyboardType="numeric"
                className="pl-10 h-12 bg-muted/5 border-border/60 focus:border-primary focus:bg-background transition-all font-medium"
              />
            </View>
          </View>
        );

      case 'date':
        return (
          <View>
            <Label />
            <Button
              variant="outline"
              onPress={() => setShowDatePicker(true)}
              className={cn(
                "h-12 w-full justify-start pl-3 text-left font-normal bg-muted/5 border-border/60",
                !value && "text-muted-foreground"
              )}
            >
              <Icon as={Calendar} size={18} className="mr-2 text-muted-foreground" />
              <Text className={value ? "text-foreground" : "text-muted-foreground"}>
                {value ? new Date(value).toLocaleDateString() : "Select date"}
              </Text>
            </Button>
            {showDatePicker && Platform.OS !== 'web' && (
              <Animated.View
                entering={SlideInDown.duration(300).springify()}
                exiting={SlideOutDown.duration(200)}
              >
                <DateTimePicker
                  value={value ? new Date(value) : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      onChange(selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              </Animated.View>
            )}
            {/* Web fallback omitted for brevity as mainly targeting native feel per instructions */}
          </View>
        );

      case 'select':
        return (
          <View>
            <Label />
            <Select
              value={{ value: value || '', label: value || '' }}
              onValueChange={(option) => onChange(option?.value)}
            >
              <SelectTrigger className="h-12 bg-muted/5 border-border/60 pl-3">
                <View className="flex-row items-center gap-2">
                  <Icon as={List} size={18} className="text-muted-foreground" />
                  <SelectValue placeholder={`Select passed ${field.label.toLowerCase()}`} />
                </View>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {field.options?.map((option) => (
                    <SelectItem key={option} label={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </View>
        );

      case 'boolean':
        return (
          <View className="flex-row items-center justify-between p-3 bg-muted/5 rounded-xl border border-border/60 mt-4">
            <View className="gap-1 flex-1">
              <Text className="text-base font-medium text-foreground">{field.label}</Text>
              <Text className="text-xs text-muted-foreground">Toggle {field.label.toLowerCase()} status</Text>
            </View>
            <Switch
              checked={value === true || value === 'true'}
              onCheckedChange={onChange}
            />
          </View>
        );

      default:
        return (
          <View>
            <Label />
            <Input
              placeholder={field.label}
              value={value?.toString() || ''}
              onChangeText={onChange}
              className="h-12 bg-muted/5 border-border/60"
            />
          </View>
        );
    }
  };

  return (
    <Animated.View
      entering={Platform.OS !== 'web' ? FadeIn.duration(300) : undefined}
      exiting={Platform.OS !== 'web' ? FadeOut.duration(200) : undefined}
      className="mb-1"
    >
      {renderField()}
    </Animated.View>
  );
}
