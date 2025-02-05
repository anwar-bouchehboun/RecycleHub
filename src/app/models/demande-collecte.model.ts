export interface TypeDechet {
  type: 'plastique' | 'verre' | 'papier' | 'metal';
  poids: number;
}

export interface DemandeCollecte {
  id: number;
  userId: number;
  types: TypeDechet[];
  photos?: string[];
  poidsTotal: number;
  adresse: {
    ville: string;
    rue: string;
  };
  dateCollecte: Date;
  creneauHoraire: string;
  notes?: string;
  statut: 'en_attente' | 'validee' | 'rejetee' | 'terminee';
  dateCreation: Date;
  dateMiseAJour?: Date;
}
