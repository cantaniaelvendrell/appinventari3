export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
}

export interface Subfamily {
  id: string;
  name: string;
  family_id: string;
  description?: string;
}

export interface Item {
  id: string;
  name: string;
  model: string;
  family_id: string;
  subfamily_id: string;
  usage: 'internal' | 'external';
  image_url?: string;
  observations?: string;
  created_at: string;
  updated_at: string;
}

export interface ItemLocation {
  item_id: string;
  location_id: string;
  quantity: number;
} 