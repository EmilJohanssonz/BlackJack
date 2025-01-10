// type cards value

export interface Card {
  image: string;
  value: string;
  suit: string;
  code: string;
}

export interface DrawResponse {
  cards: Card[];
  deck_id: string;
  remaining: number;
  susses: boolean;
}

