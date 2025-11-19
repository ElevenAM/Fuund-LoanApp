import {
  users,
  loanApplications,
  documents,
  type User,
  type UpsertUser,
  type LoanApplication,
  type InsertLoanApplication,
  type Document,
  type InsertDocument,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Loan Application operations
  createApplication(application: InsertLoanApplication): Promise<LoanApplication>;
  getApplication(id: string): Promise<LoanApplication | undefined>;
  getUserApplications(userId: string): Promise<LoanApplication[]>;
  updateApplication(id: string, application: Partial<InsertLoanApplication>): Promise<LoanApplication>;
  deleteApplication(id: string): Promise<void>;

  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentById(id: string): Promise<Document | undefined>;
  getApplicationDocuments(applicationId: string): Promise<Document[]>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Loan Application operations
  async createApplication(application: InsertLoanApplication): Promise<LoanApplication> {
    const [newApplication] = await db
      .insert(loanApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  async getApplication(id: string): Promise<LoanApplication | undefined> {
    const [application] = await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.id, id));
    return application;
  }

  async getUserApplications(userId: string): Promise<LoanApplication[]> {
    const applications = await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId))
      .orderBy(desc(loanApplications.updatedAt));
    return applications;
  }

  async updateApplication(
    id: string,
    application: Partial<InsertLoanApplication>
  ): Promise<LoanApplication> {
    const [updated] = await db
      .update(loanApplications)
      .set({
        ...application,
        updatedAt: new Date(),
      })
      .where(eq(loanApplications.id, id))
      .returning();
    return updated;
  }

  async deleteApplication(id: string): Promise<void> {
    await db.delete(loanApplications).where(eq(loanApplications.id, id));
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async getDocumentById(id: string): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }

  async getApplicationDocuments(applicationId: string): Promise<Document[]> {
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.applicationId, applicationId))
      .orderBy(desc(documents.createdAt));
    return docs;
  }

  async updateDocument(
    id: string,
    document: Partial<InsertDocument>
  ): Promise<Document> {
    const [updated] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updated;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }
}

export const storage = new DatabaseStorage();
