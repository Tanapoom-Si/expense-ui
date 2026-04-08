import { User } from './user.model';
import { Category } from './category.model';

export interface Transaction {
  id: number;
  amount: number;
  createDate: string;
  note: string | null;
  categoryId: Category;
  user: User;
}