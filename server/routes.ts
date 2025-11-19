import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import { Client } from "@replit/object-storage";
import { insertLoanApplicationSchema, insertDocumentSchema } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

// Initialize object storage client with bucket ID
const getObjectStorage = () => {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) {
    throw new Error("DEFAULT_OBJECT_STORAGE_BUCKET_ID environment variable is required");
  }
  return new Client({ bucketId });
};

/**
 * Calculate monthly payment using the standard loan amortization formula:
 * M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 * where: P = principal, r = monthly interest rate, n = number of payments
 */
function calculateMonthlyPayment(
  principal: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  const monthlyRate = annualInterestRate / 100 / 12;
  const numPayments = loanTermYears * 12;
  
  if (monthlyRate === 0) {
    return principal / numPayments; // Interest-free loan
  }
  
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(payment * 100) / 100; // Round to cents
}

/**
 * Auto-calculate loan metrics based on application data
 */
function calculateLoanMetrics(data: any): {
  ltv?: string;
  dscr?: string;
  monthlyInterest?: string;
} {
  const metrics: any = {};
  
  try {
    const loanAmount = parseFloat(data.loanAmount || "0");
    const loanSpecifics = data.loanSpecifics || {};
    
    // Extract values from loanSpecifics JSON
    const propertyValue = parseFloat(loanSpecifics.propertyValue || "0");
    const interestRate = parseFloat(loanSpecifics.interestRate || "0");
    const loanTermYears = parseFloat(loanSpecifics.loanTerm || "0");
    const annualNOI = parseFloat(data.annualNOI || "0");
    
    // Calculate LTV: (Loan Amount / Property Value) × 100
    if (loanAmount > 0 && propertyValue > 0) {
      const ltv = (loanAmount / propertyValue) * 100;
      metrics.ltv = ltv.toFixed(2);
    }
    
    // Calculate Monthly Interest (first month): (Loan Amount × Annual Rate) / 12
    if (loanAmount > 0 && interestRate > 0) {
      const monthlyInterest = (loanAmount * (interestRate / 100)) / 12;
      metrics.monthlyInterest = monthlyInterest.toFixed(2);
    }
    
    // Calculate DSCR: Annual NOI / Annual Debt Service
    // Annual Debt Service = Monthly Payment × 12
    if (annualNOI > 0 && loanAmount > 0 && interestRate > 0 && loanTermYears > 0) {
      const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTermYears);
      const annualDebtService = monthlyPayment * 12;
      const dscr = annualNOI / annualDebtService;
      metrics.dscr = dscr.toFixed(2);
    }
  } catch (error) {
    console.error("Error calculating loan metrics:", error);
  }
  
  return metrics;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware setup
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Loan Application routes
  app.post("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate and parse request body with strict mode
      const validationResult = insertLoanApplicationSchema
        .strict()
        .safeParse({
          ...req.body,
          userId, // Server-controlled field
        });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validationResult.error.errors 
        });
      }
      
      // Calculate loan metrics
      const calculatedMetrics = calculateLoanMetrics(validationResult.data);
      
      // Merge calculated metrics with validated data
      const applicationData = {
        ...validationResult.data,
        ...calculatedMetrics,
      };
      
      // Use validated and calculated data
      const application = await storage.createApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.get("/api/applications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      // Verify user owns this application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.patch("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      // Verify user owns this application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Reject if userId is in the request body to prevent tampering
      if ('userId' in req.body) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: [{ path: ['userId'], message: 'userId cannot be modified' }]
        });
      }
      
      // Validate request body with strict mode
      const validationResult = insertLoanApplicationSchema
        .strict()
        .partial()
        .safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validationResult.error.errors 
        });
      }
      
      // Merge existing application data with updates for metric calculation
      const mergedData = {
        ...application,
        ...validationResult.data,
      };
      
      // Recalculate loan metrics based on merged data
      const calculatedMetrics = calculateLoanMetrics(mergedData);
      
      // Merge updates with calculated metrics
      const updateData = {
        ...validationResult.data,
        ...calculatedMetrics,
      };
      
      // Use validated and calculated data
      const updated = await storage.updateApplication(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", isAuthenticated, async (req: any, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      // Verify user owns this application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteApplication(req.params.id);
      res.json({ message: "Application deleted successfully" });
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Document routes
  app.post(
    "/api/applications/:id/documents",
    isAuthenticated,
    upload.single("file"),
    async (req: any, res) => {
      try {
        const application = await storage.getApplication(req.params.id);
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        // Verify user owns this application
        if (application.userId !== req.user.claims.sub) {
          return res.status(403).json({ message: "Forbidden" });
        }

        const file = req.file;
        const { name, type } = req.body;

        if (!name || !type) {
          return res.status(400).json({ message: "Document name and type are required" });
        }

        let storagePath = null;
        let storageUrl = null;

        // Upload to object storage if file is provided
        if (file) {
          const privateDir = process.env.PRIVATE_OBJECT_DIR;
          if (!privateDir) {
            return res.status(500).json({ message: "Object storage is not configured" });
          }
          
          try {
            const objectStorage = getObjectStorage();
            const fileName = `${req.params.id}/${Date.now()}-${file.originalname}`;
            const privatePath = `${privateDir}/${fileName}`;
            
            // Upload and check Result
            const uploadResult = await objectStorage.uploadFromBytes(privatePath, file.buffer);
            if (!uploadResult.ok) {
              console.error("Object storage upload failed:", uploadResult.error);
              return res.status(500).json({ message: "Failed to upload file to storage" });
            }
            
            storagePath = privatePath;
          } catch (storageError) {
            console.error("Object storage error:", storageError);
            return res.status(500).json({ message: "Failed to upload file to storage" });
          }
        }

        // Construct document data with only required and provided fields
        const documentData: any = {
          applicationId: req.params.id,
          userId: req.user.claims.sub,
          name,
          type,
          status: file ? "uploaded" : "pending",
        };

        // Add optional fields only if they have values
        if (file?.mimetype) {
          documentData.fileType = file.mimetype.split("/")[1];
        }
        if (file?.size) {
          documentData.fileSize = `${(file.size / 1024).toFixed(1)} KB`;
        }
        if (storagePath) {
          documentData.storagePath = storagePath;
        }
        if (storageUrl) {
          documentData.storageUrl = storageUrl;
        }
        if (file) {
          documentData.uploadedAt = new Date();
        }

        // Validate document data with strict mode
        const validationResult = insertDocumentSchema.strict().safeParse(documentData);
        
        if (!validationResult.success) {
          return res.status(400).json({ 
            message: "Invalid document data",
            errors: validationResult.error.errors 
          });
        }

        const document = await storage.createDocument(validationResult.data);
        res.json(document);
      } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  );

  app.get("/api/applications/:id/documents", isAuthenticated, async (req: any, res) => {
    try {
      const application = await storage.getApplication(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      // Verify user owns this application
      if (application.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const documents = await storage.getApplicationDocuments(req.params.id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      // Get document by its own ID, not application ID
      const document = await storage.getDocumentById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify user owns this document
      if (document.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Delete from object storage if exists
      if (document.storagePath) {
        try {
          const objectStorage = getObjectStorage();
          const deleteResult = await objectStorage.delete(document.storagePath);
          
          if (!deleteResult.ok) {
            console.error("Object storage deletion failed:", deleteResult.error);
            return res.status(500).json({ 
              message: "Failed to delete file from storage",
              error: deleteResult.error?.message 
            });
          }
        } catch (error) {
          console.error("Error deleting from storage:", error);
          return res.status(500).json({ message: "Failed to delete file from storage" });
        }
      }

      await storage.deleteDocument(req.params.id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
