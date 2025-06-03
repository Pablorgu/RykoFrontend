import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import FloatingLabelInput from './FloatingLabel';
import FloatingLabelSelect from './FloatingLabelSelect';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - 1899 }, (_, i) => {
  const y = currentYear - i;
  return { label: String(y), value: String(y) };
});

export function DatePickerField({
  label,
  date,
  onChange,
}: {
  label: string;
  date: Date | null;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(date || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(date);

  useEffect(() => {
    if (date) {
      setCalendarDate(date);
      setSelectedDate(date);
    }
  }, [date]);

  const formatted = selectedDate ? selectedDate.toLocaleDateString() : '';

  return (
    <View className="mb-4">
      <Pressable onPress={() => setOpen(o => !o)}>
        <FloatingLabelInput
          label={label}
          value={formatted}
          onChangeText={() => { }}
          inputProps={{ editable: false }}
        />
      </Pressable>

      {open && (
        <View>
          {/* Selector rápido de año */}
          <FloatingLabelSelect
            label="Año"
            value={String(calendarDate.getFullYear())}
            onValueChange={val => {
              if (val === null) return;
              const y = parseInt(val, 10);
              const newCal = new Date(calendarDate);
              newCal.setFullYear(y);
              setCalendarDate(newCal);
            }}
            options={yearOptions}
          />

          <Calendar
            key={calendarDate.toISOString().split('T')[0]}
            current={calendarDate.toISOString().split('T')[0]}
            enableSwipeMonths={true}
            markedDates={{
              ...(selectedDate
                ? {
                  [selectedDate.toISOString().split('T')[0]]: {
                    selected: true,
                    selectedColor: '#22c55e',
                  },
                }
                : {}),
            }}
            onDayPress={(day: DateData) => {
              const [y, m, d] = day.dateString.split('-').map(Number);
              const newDate = new Date(y, m - 1, d);
              setSelectedDate(newDate);
              onChange(newDate);
              setOpen(false);
            }}
            onMonthChange={({ dateString }) => {
              setCalendarDate(new Date(dateString));
            }}
            theme={{
              backgroundColor: '#000',
              calendarBackground: '#000',
              textSectionTitleColor: '#fff',
              dayTextColor: '#fff',
              monthTextColor: '#fff',
              arrowColor: '#22c55e',
              todayTextColor: '#22c55e',
            }}
            style={{
              borderWidth: 1,
              borderColor: '#22c55e',
              borderRadius: 8,
            }}
          />
        </View>
      )}
    </View>)
}
