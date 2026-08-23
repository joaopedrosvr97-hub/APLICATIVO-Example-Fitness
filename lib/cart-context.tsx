import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  colorHex: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState };

const VALID_COUPONS: Record<string, number> = {
  'F3APP': 5,
  'F3FITNESS': 10,
  'PRIMEIRACOMPRA': 15,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.payload) };
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((item) => item.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    case 'APPLY_COUPON':
      return { ...state, couponCode: action.payload.code, couponDiscount: action.payload.discount };
    case 'REMOVE_COUPON':
      return { ...state, couponCode: '', couponDiscount: 0 };
    case 'CLEAR_CART':
      return { items: [], couponCode: '', couponDiscount: 0 };
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
}

interface CartContextValue {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    couponCode: '',
    couponDiscount: 0,
  });

  useEffect(() => {
    AsyncStorage.getItem('f3fitness_cart').then((data) => {
      if (data) {
        try {
          dispatch({ type: 'LOAD_CART', payload: JSON.parse(data) });
        } catch {}
      }
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('f3fitness_cart', JSON.stringify(state));
  }, [state]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 199 ? 0 : 19.90;
  const discount = subtotal * (state.couponDiscount / 100);
  const total = subtotal + shipping - discount;

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQuantity = (id: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const applyCoupon = (code: string): boolean => {
    const upperCode = code.toUpperCase();
    const discountPct = VALID_COUPONS[upperCode];
    if (discountPct) {
      dispatch({ type: 'APPLY_COUPON', payload: { code: upperCode, discount: discountPct } });
      return true;
    }
    return false;
  };
  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        totalItems,
        subtotal,
        shipping,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
