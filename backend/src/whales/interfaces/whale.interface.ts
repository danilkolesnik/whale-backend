export interface Whale {
  id: string;
  total: number; // сколько должны закинуть юзеры
  users: string[]; // массив юзеров которые закинули монеты
  moneyTotal: number; // сколько закинули юзеры
  createdAt: Date;
  updatedAt: Date;
}
