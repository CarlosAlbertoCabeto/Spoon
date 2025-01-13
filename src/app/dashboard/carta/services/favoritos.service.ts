import { collection, addDoc, deleteDoc, getDocs, query, where, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface FavoritoDoc {
  restauranteId: string;
  combinacionId: string;
  createdAt: Date;
}

export const favoritosService = {
  async getFavoritos(restauranteId: string) {
    const q = query(
      collection(db, 'combinacionesFavoritas'),
      where('restauranteId', '==', restauranteId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  },

  async toggleFavorito(restauranteId: string, combinacionId: string) {
    const q = query(
      collection(db, 'combinacionesFavoritas'),
      where('restauranteId', '==', restauranteId),
      where('combinacionId', '==', combinacionId)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Agregar a favoritos
      return addDoc(collection(db, 'combinacionesFavoritas'), {
        restauranteId,
        combinacionId,
        createdAt: new Date()
      });
    } else {
      // Remover de favoritos
      const docRef = doc(db, 'combinacionesFavoritas', snapshot.docs[0].id);
      return deleteDoc(docRef);
    }
  }
};