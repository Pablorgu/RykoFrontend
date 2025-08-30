import { router, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import api from '../api/client';
import { getCurrentUserId } from '../services/_user';

// Interface for the dish data from API
interface Dish {
  id: string;
  name: string;
  description: string;
  image: string;
  ingredients: string[] | { name: string }[];
  macros: { carbs: number; fat: number; protein: number };
}

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
  router.push(`/dish-detail/${plateId}`);
}

export default function plates() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUserDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = await getCurrentUserId();
      if (!userId) {
        setError('No se pudo obtener el ID del usuario');
        return;
      }
      
      const response = await api.get(`/dishes/user/${userId}/plates`);
      
      const dishesData = response.data.map((dish: any) => ({
        id: dish.id,
        name: dish.name,
        description: dish.description || '',
        image: dish.image || '',
        ingredients: Array.isArray(dish.ingredients) 
          ? dish.ingredients.map((ing: any) => 
              typeof ing === 'string' ? ing : ing.name
            )
          : [],
        macros: dish.macros || { carbs: 0, fat: 0, protein: 0 }
      }));
      
      setDishes(dishesData);
    } catch (error: any) {
      console.error('Error fetching user dishes:', error);
      setError(error.response?.data?.message || 'Error al cargar los platos');
    } finally {
      setLoading(false);
    }
  };
  
  useFocusEffect(
    React.useCallback(() => {
      fetchUserDishes();
    }, [])
  );
  
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
  
  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#A3FF57" />
        <Text style={{ color: '#FFFFFF', marginTop: 16, fontSize: 16 }}>Cargando platos...</Text>
      </View>
    );
  }
  
  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#FF6B6B', fontSize: 18, textAlign: 'center', marginBottom: 20 }}>
          {error}
        </Text>
        <Pressable 
          style={{ backgroundColor: '#A3FF57', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 }}
          onPress={() => window.location.reload()}
        >
          <Text style={{ color: '#000000', fontWeight: '600' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ 
          paddingHorizontal: margin,
          paddingTop: width < 480 ? insets.top + 20 : 32,
          paddingBottom: 16
        }}>
          <Text style={{
            fontSize: width < 480 ? 20 : width < 768 ? 24 : 28,
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: width < 480 ? 20 : 32
          }}>
            Mis platos
          </Text>
          
          {/* Empty state */}
          {dishes.length === 0 ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
              <Text style={{ color: '#94A3B8', fontSize: 18, textAlign: 'center', marginBottom: 16 }}>
                No tienes platos creados aún
              </Text>
              <Text style={{ color: '#64748B', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                Crea tu primer plato usando el botón +
              </Text>
            </View>
          ) : (
            /* Container of cards with dynamic calculations for each screen */
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginHorizontal: -margin / 2
            }}>
              {dishes.map(plate => (
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
                        source={{ uri: plate.image || 'https://via.placeholder.com/400x300?text=Sin+Imagen' }} 
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
          )}
        </View>
      </ScrollView>
      
      {/* Floating button + */}
      <View style={{
        position: 'absolute',
        bottom: 24,
        right: 24
      }}>
        <Pressable 
          onPress={() => router.push('/create-dish')} 
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