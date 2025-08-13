import { useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const PLATES = [
  {
    id: '1',
    name: 'Ensalada César',
    description: 'Lechuga fresca, pollo y aderezo suave.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Lechuga', 'Pollo', 'Queso', 'Aderezo'],
    macros: { carbs: 30, fat: 40, protein: 30 }
  },
  {
    id: '2',
    name: 'Tortilla de patatas',
    description: 'Clásico español con huevo y patata.',
    image: 'https://imgs.search.brave.com/MiNbBtaAR3TZGFGifkLd7F5ZbkCgw51T_2S5adex2U8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/ZW5lcy4yMG1pbnV0/b3MuZXMvZmlsZXMv/aW1hZ2VfOTkwXzU1/Ni91cGxvYWRzL2lt/YWdlbmVzLzIwMjMv/MDQvMjYvdG9ydGls/bGEtZGUtcGF0YXRh/cy5qcGVn',
    ingredients: ['Huevo', 'Patata', 'Cebolla', 'Aceite'],
    macros: { carbs: 20, fat: 50, protein: 30 }
  },
  {
    id: '3',
    name: 'Salmón a la plancha',
    description: 'Salmón fresco con verduras al vapor.',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80',
    ingredients: ['Salmón', 'Brócoli', 'Zanahoria', 'Limón'],
    macros: { carbs: 15, fat: 35, protein: 50 }
  },
  {
    id: '4',
    name: 'Pasta Carbonara',
    description: 'Pasta cremosa con panceta y queso parmesano.',
    image: 'https://imgs.search.brave.com/oVAtekUMIzt9IevFPyoBgzJwhO_nx1aqIRy_2D-J5N0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDY1/MTQyMTMyL3Bob3Rv/L3Bhc3RhLWNhcmJv/bmFyYS5qcGc_cz02/MTJ4NjEyJnc9MCZr/PTIwJmM9WkdXTFRf/X2J3ZG5yUVU0YnVj/b0tMMnVQdHIyWkx2/TVBNZzJVRmt2Q2Ry/bz0',
    ingredients: ['Pasta', 'Panceta', 'Huevo', 'Parmesano'],
    macros: { carbs: 55, fat: 25, protein: 20 }
  }
];

function MacroPieChart({ macros, screenWidth }: { 
  macros: { carbs: number; fat: number; protein: number };
  screenWidth: number;
}) {
  const total = macros.carbs + macros.fat + macros.protein;
  const carbsPercent = (macros.carbs / total) * 100;
  const fatPercent = (macros.fat / total) * 100;
  const proteinPercent = (macros.protein / total) * 100;
  
  // Dynamic size of the graph based on screen width
  const size = screenWidth < 480 ? 50 : screenWidth < 768 ? 55 : 60;
  const center = size / 2;
  const radius = size * 0.37;
  const innerRadius = size * 0.2;
  
  const createDonutPath = (startAngle: number, endAngle: number) => {
    const outerStart = polarToCartesian(center, center, radius, endAngle);
    const outerEnd = polarToCartesian(center, center, radius, startAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", outerStart.x, outerStart.y,
      "A", radius, radius, 0, largeArcFlag, 0, outerEnd.x, outerEnd.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };
  
  let currentAngle = 0;
  const carbsAngle = (carbsPercent / 100) * 360;
  const fatAngle = (fatPercent / 100) * 360;
  const proteinAngle = (proteinPercent / 100) * 360;
  
  const textSize = screenWidth < 480 ? 10 : screenWidth < 768 ? 11 : 12;
  const legendWidth = screenWidth < 480 ? 110 : screenWidth < 768 ? 130 : 150;
  
  return (
    <View style={{
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }}>
      {/* Graph */}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Path
            d={createDonutPath(currentAngle, currentAngle + carbsAngle)}
            fill="#A3FF57"
          />
          <Path
            d={createDonutPath(currentAngle + carbsAngle, currentAngle + carbsAngle + fatAngle)}
            fill="#FFB84D"
          />
          <Path
            d={createDonutPath(currentAngle + carbsAngle + fatAngle, currentAngle + carbsAngle + fatAngle + proteinAngle)}
            fill="#4DABF7"
          />
        </Svg>
      </View>
      
      {/* Legend */}
      <View style={{ flexDirection: 'column', gap: 3, width: legendWidth }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#A3FF57' }} />
            <Text style={{ fontSize: textSize, color: '#D1D5DB', fontWeight: '500' }} numberOfLines={1}>
              Carbohidratos
            </Text>
          </View>
          <Text style={{ fontSize: textSize, color: '#9CA3AF', fontWeight: '500', marginLeft: 8 }}>
            {Math.round(carbsPercent)}%
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFB84D' }} />
            <Text style={{ fontSize: textSize, color: '#D1D5DB', fontWeight: '500' }} numberOfLines={1}>
              Grasas
            </Text>
          </View>
          <Text style={{ fontSize: textSize, color: '#9CA3AF', fontWeight: '500', marginLeft: 8 }}>
            {Math.round(fatPercent)}%
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4DABF7' }} />
            <Text style={{ fontSize: textSize, color: '#D1D5DB', fontWeight: '500' }} numberOfLines={1}>
              Proteínas
            </Text>
          </View>
          <Text style={{ fontSize: textSize, color: '#9CA3AF', fontWeight: '500', marginLeft: 8 }}>
            {Math.round(proteinPercent)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

function handlePlatePress(plateId: string) {
  console.log('Navegando a detalles del plato:', plateId);
}

export default function plates() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  
  const margin = 16;
  let numCols: number;
  
  if (width < 480) {
    numCols = 2; // Mobile: 2 cards per row
  } else if (width < 768) {
    numCols = 2; // Small tablet: 2 cards per row
  } else if (width < 1200) {
    numCols = 3; // Desktop: 3 cards per row
  } else {
    numCols = 4; // Desktop: 4 cards per row
  }
  
  const cardWidth = (width - (numCols + 1) * margin) / numCols;
  
  // Tamaños dinámicos según el ancho de pantalla - Más grandes en desktop
  const imageHeight = width < 480 ? 100 : width < 768 ? 120 : 160;
  const titleSize = width < 480 ? 14 : width < 768 ? 16 : 18;
  const subtitleSize = width < 480 ? 10 : width < 768 ? 11 : 12;
  const cardPadding = width < 480 ? 12 : width < 768 ? 14 : 18;
  
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ 
          paddingHorizontal: margin,
          paddingTop: width < 480 ? 20 : 32,
          paddingBottom: 16
        }}>
          <Text style={{
            fontSize: width < 480 ? 20 : width < 768 ? 24 : 28,
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: width < 480 ? 20 : 32
          }}>
            My plates
          </Text>
          
          {/* Container of cards with dynamic calculations for each screen */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -margin / 2
          }}>
            {PLATES.map(plate => (
              <Pressable 
                key={plate.id}
                style={{
                  width: cardWidth,
                  marginHorizontal: margin / 2,
                  marginBottom: margin,
                  backgroundColor: '#1E293B',
                  borderRadius: 16,
                  padding: cardPadding,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                  overflow: 'hidden'
                }}
                onPress={() => handlePlatePress(plate.id)}
              >
                {/* Vertical layout for all screens */}
                <View style={{
                  flexDirection: 'column',
                  gap: width >= 768 ? 12 : 8
                }}>
                  {/* Image */}
                  <View style={{
                    width: '100%',
                    marginBottom: width >= 768 ? 8 : 6
                  }}>
                    <Image 
                      source={{ uri: plate.image }} 
                      style={{
                        width: '100%',
                        height: imageHeight,
                        borderRadius: 12,
                        backgroundColor: '#334155'
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  
                  {/* Title and ingredients */}
                  <View style={{ marginBottom: width >= 768 ? 8 : 6 }}>
                    <Text style={{
                      fontSize: titleSize,
                      fontWeight: '600',
                      color: '#FFFFFF',
                      marginBottom: width >= 768 ? 8 : 6,
                      textAlign: 'center'
                    }} numberOfLines={2}>
                      {plate.name}
                    </Text>
                    <Text style={{
                      fontSize: subtitleSize,
                      color: '#94A3B8',
                      marginBottom: width >= 768 ? 6 : 4,
                      textAlign: 'center'
                    }}>
                      Ingredientes
                    </Text>
                    <Text style={{
                      fontSize: subtitleSize,
                      color: '#CBD5E1',
                      textAlign: 'center',
                      lineHeight: width >= 768 ? 18 : 16
                    }} numberOfLines={2}>
                      {plate.ingredients.slice(0, 3).join(', ')}
                      {plate.ingredients.length > 3 ? '...' : ''}
                    </Text>
                  </View>
                  
                  {/* Macros chart */}
                  <View style={{
                    alignItems: 'center'
                  }}>
                    <MacroPieChart macros={plate.macros} screenWidth={width} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Floating button + */}
      <View style={{
        position: 'absolute',
        bottom: 24,
        right: 24
      }}>
        <Pressable 
          onPress={() => router.push('/create-dish')} // Agregar esta línea
          style={{
            backgroundColor: '#22C55E',
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8
          }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 24,
            includeFontPadding: false,
            textAlignVertical: 'center',
            marginTop: 0,
            paddingTop: 0
          }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}