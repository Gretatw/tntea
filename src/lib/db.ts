import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot, orderBy, QueryConstraint } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Product, Order, OrderStatus } from './types';

// Firestore Error Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ----------------------------------------------------
// Products
// ----------------------------------------------------

export async function getProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), orderBy('category'), orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
    return [];
  }
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, 'products'));
    await setDoc(docRef, product);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'products');
    return '';
  }
}

// ----------------------------------------------------
// Orders
// ----------------------------------------------------

export async function createOrder(order: Omit<Order, 'id'>): Promise<string> {
  try {
    const docRef = doc(collection(db, 'orders'));
    await setDoc(docRef, order);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'orders');
    return '';
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, updatedAt: number): Promise<void> {
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status, updatedAt });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export function subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  });
}

export function subscribeToAllOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'orders');
  });
}

// ----------------------------------------------------
// User Roles
// ----------------------------------------------------

export async function isUserAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const docRef = doc(db, 'userRoles', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().isAdmin === true) {
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `userRoles/${userId}`);
    return false;
  }
}
