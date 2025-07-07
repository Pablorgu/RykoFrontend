import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import DropDownPicker, { ValueType, ItemType } from 'react-native-dropdown-picker'

interface Option {
  label: string
  value: string
}

interface FloatingLabelMultiSelectProps {
  label: string
  values: string[]
  onChangeValues: (vals: string[]) => void
  options: Option[]
}

export default function FloatingLabelMultiSelect({
  label,
  values,
  onChangeValues,
  options,
}: FloatingLabelMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[] | null>(values)
  const [items, setItems] = useState<ItemType<string>[]>(() =>
    options.map(opt => ({ label: opt.label, value: opt.value }))
  )

  useEffect(() => {
    setSelected(values)
  }, [values])

  // Construimos un string con los labels de las opciones seleccionadas
  const selectedLabels = items
    .filter(item => (selected ?? []).includes(item.value!))
    .map(item => item.label)
    .join(', ')

  return (
    <View style={[styles.wrapper, open && { zIndex: 1000 }]}>
      <Text style={styles.staticLabel}>{label}</Text>

      <DropDownPicker
        open={open}
        setOpen={setOpen}
        listMode="SCROLLVIEW"

        multiple={true}
        min={0}
        max={items.length}
        closeAfterSelecting={false}

        value={selected ?? []}
        setValue={(vals: ValueType[] | ((prev: ValueType[]) => ValueType[])) => {
          let newVals: string[]
          if (typeof vals === 'function') {
            newVals = (vals(selected ?? []) as string[])
          } else {
            newVals = vals as string[]
          }
          setSelected(newVals)
          onChangeValues(newVals)
        }}

        items={items}
        setItems={setItems}

        containerStyle={[styles.container, open && { zIndex: 1000, elevation: 1000 }]}
        style={styles.picker}

        dropDownContainerStyle={[styles.dropdownContainer, { position: 'absolute', zIndex: 1000 }]}

        listItemContainerStyle={styles.listItemContainer}
        listItemLabelStyle={styles.listItemLabel}

        selectedItemContainerStyle={styles.selectedItemContainer}
        selectedItemLabelStyle={styles.selectedItemLabel}

        placeholder={selectedLabels || `Selecciona ${label.toLowerCase()}`}
        placeholderStyle={styles.placeholderLabel}
        multipleText={selectedLabels || `Selecciona ${label.toLowerCase()}`}

        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}

        textStyle={{ color: '#fff' }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'visible',
  },
  staticLabel: {
    position: 'absolute',
    marginTop: -6,
    left: 12,
    backgroundColor: '#000',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#aaa',
    zIndex: 11,
  },
  container: {
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 8,
    zIndex: 10,
  },
  picker: {
    backgroundColor: 'transparent',
    height: 56,
    color: '#fff',
  },
  dropdownContainer: {
    backgroundColor: '#000',
    borderColor: '#22c55e',
    position: 'absolute',
    zIndex: 1000,
  },
  listItemContainer: {
    height: 48,
    paddingHorizontal: 12,
  },
  listItemLabel: {
    color: '#fff',
    fontSize: 16,
  },
  selectedItemContainer: {
    backgroundColor: '#002200',
  },
  selectedItemLabel: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  placeholderLabel: {
    color: '#999',
  },
})

