import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealType, MEAL_DISPLAY_NAMES } from '../../(types)/domain';
import { MealCard } from './_MealCard';
import { useDayStore } from '../../(store)/dayStore';

interface MealCarouselProps {
  meals: MealType[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Hook personalizado para responsive
const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const isSmall = dimensions.width < 400;  // pequeños
  const isMedium = dimensions.width >= 400 && dimensions.width < 500; // estándar
  const isLarge = dimensions.width >= 500;  // grandes
  
  return {
    width: dimensions.width,
    height: dimensions.height,
    isSmall,
    isMedium,
    isLarge,
    scale: (size: number) => (dimensions.width / 375) * size
  };
};

export function MealCarousel({ meals }: MealCarouselProps) {
  const { day } = useDayStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const { width, height, isSmall, isMedium, isLarge, scale } = useResponsive();
  
  // Responsive card width
  const CARD_WIDTH = isSmall ? width - 30 : isMedium ? width - 20 : width - 16;
  const goToNext = () => {
    if (currentIndex < meals.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * CARD_WIDTH,
        animated: true,
      });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      scrollViewRef.current?.scrollTo({
        x: prevIndex * CARD_WIDTH,
        animated: true,
      });
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setCurrentIndex(index);
  };

  // Responsive button size
  const buttonSize = isSmall ? 40 : isMedium ? 44 : 48;
  const iconSize = isSmall ? 18 : isMedium ? 22 : 24;
  const buttonPosition = isSmall ? 8 : isMedium ? 12 : 16;

  return (
    <View className="relative">
      {/* Navigation Arrows*/}
      <View 
        className="absolute top-1/2 z-10" 
        style={{ 
          left: buttonPosition,
          transform: [{ translateY: -buttonSize / 2 }] 
        }}
      >
        <TouchableOpacity
          onPress={goToPrevious}
          disabled={currentIndex === 0}
          className={`rounded-full items-center justify-center shadow-lg ${
            currentIndex === 0 ? 'bg-zinc-800' : 'bg-zinc-700'
          }`}
          style={{
            width: buttonSize,
            height: buttonSize
          }}
        >
          <Ionicons
            name="chevron-back"
            size={iconSize}
            color={currentIndex === 0 ? '#52525b' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>

      <View 
        className="absolute top-1/2 z-10" 
        style={{ 
          right: buttonPosition,
          transform: [{ translateY: -buttonSize / 2 }] 
        }}
      >
        <TouchableOpacity
          onPress={goToNext}
          disabled={currentIndex === meals.length - 1}
          className={`rounded-full items-center justify-center shadow-lg ${
            currentIndex === meals.length - 1 ? 'bg-zinc-800' : 'bg-zinc-700'
          }`}
          style={{
            width: buttonSize,
            height: buttonSize
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={iconSize}
            color={currentIndex === meals.length - 1 ? '#52525b' : '#ffffff'}
          />
        </TouchableOpacity>
      </View>

      {/*Tarjeta */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={handleScroll}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ 
          paddingHorizontal: isSmall ? 10 : isMedium ? 15 : 20,
          alignItems: 'flex-start', 
          flexDirection: 'row' 
        }}
        style={{ flexGrow: 0 }} 
      >
        {meals.map((mealType, index) => {
          return (
            <View 
              key={mealType} 
              style={{ 
                width: CARD_WIDTH,
                paddingHorizontal: isSmall ? 2 : isMedium ? 4 : 6,
                alignSelf: 'flex-start',
                height: 'auto'
              }}
            >
              <MealCard mealType={mealType} />
            </View>
          );
        })}
      </ScrollView>

      {/* Dots Indicator*/}
      <View className="flex-row justify-center py-2" style={{ gap: isSmall ? 6 : 8 }}>
        {meals.map((_, index) => {
          const dotSize = isSmall ? 8 : isMedium ? 10 : 12;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setCurrentIndex(index);
                scrollViewRef.current?.scrollTo({
                  x: index * CARD_WIDTH,
                  animated: true,
                });
              }}
              className={`rounded-full ${
                index === currentIndex ? 'bg-lime-500' : 'bg-zinc-600'
              }`}
              style={{
                width: dotSize,
                height: dotSize
              }}
            />
          );
        })}
      </View>
    </View>
  );
}