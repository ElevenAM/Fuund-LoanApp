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
      
      // Use validated data only
      const application = await storage.createApplication(validationResult.data);
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
      
      // Use validated data only
      const updated = await storage.updateApplication(req.params.id, validationResult.data);
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
