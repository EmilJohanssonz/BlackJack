// type cards value

export interface Card {
  image: any;
  value: string;
  suit: string;
  code: string;
}

export interface DrawResponse {
  cards: Card[];
  deck_id: string;
  remaining: number;
  sussess: boolean;
}

