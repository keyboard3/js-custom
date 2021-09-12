export type Cat = { breed: string; yearOfBirth: number };
export interface Dog {
  breeds: string[];
  yearOfBirth: number;
}
export type Dog1 = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";