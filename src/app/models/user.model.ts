export interface User {
  id?: number;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: 'particulier' | 'collecteur';
  adresse: {
    ville: string;
    rue: string;
  };
  telephone: string;
  dateNaissance: Date;
  photo?: File;
  photoUrl?: string;
}
