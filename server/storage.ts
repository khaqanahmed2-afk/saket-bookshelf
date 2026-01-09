import { type Customer, type InsertCustomer } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<Customer | undefined>;
  getUserByUsername(username: string): Promise<Customer | undefined>;
  createUser(user: InsertCustomer): Promise<Customer>;
}

export class MemStorage implements IStorage {
  private users: Map<string, Customer>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<Customer | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<Customer | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.mobile === username,
    );
  }

  async createUser(insertUser: InsertCustomer): Promise<Customer> {
    const id = crypto.randomUUID();
    const user: Customer = { ...insertUser, id, pin: null, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
