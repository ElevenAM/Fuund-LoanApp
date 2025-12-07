import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import { Client } from "@replit/object-storage";
import { insertLoanApplicationSchema, insertDocumentSchema, type LoanApplication } from "@shared/schema";
import sgMail from "@sendgrid/mail";

const NOTIFICATION_EMAIL = "liamnguyen.mail@gmail.com";
const SENDER_EMAIL = "liam@flejling.com";

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function formatCurrency(value: string | number | null | undefined): string {
  if (!value) return "N/A";
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatLoanType(type: string): string {
  const types: Record<string, string> = {
    "permanent-acquisition": "Permanent - Acquisition",
    "permanent-refinance": "Permanent - Refinance",
    "bridge-acquisition": "Bridge - Acquisition",
    "bridge-refinance": "Bridge - Refinance",
    "construction": "Construction",
  };
  return types[type] || type;
}

function formatPropertyType(type: string | null): string {
  if (!type) return "N/A";
  const types: Record<string, string> = {
    "multifamily": "Multifamily",
    "office": "Office",
    "retail": "Retail",
    "industrial": "Industrial",
    "mixed-use": "Mixed Use",
    "self-storage": "Self Storage",
    "land": "Land",
  };
  return types[type] || type;
}

function getMimeType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop() || '';
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function sendApplicationEmail(application: LoanApplication): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SendGrid API key not configured, skipping email notification");
    return;
  }

  const attachments: Array<{ content: string; filename: string; type: string; disposition: string }> = [];
  
  try {
    const documents = await storage.getApplicationDocuments(application.id);
    
    if (documents.length > 0) {
      const objectStorage = getObjectStorage();
      
      for (const doc of documents) {
        if (doc.storagePath && doc.status === "uploaded") {
          try {
            const downloadResult = await objectStorage.downloadAsBytes(doc.storagePath);
            if (downloadResult.ok) {
              const rawValue = downloadResult.value;
              const fileBuffer = Array.isArray(rawValue) ? rawValue[0] : rawValue;
              if (!fileBuffer || fileBuffer.length === 0) {
                console.warn(`Empty file content for document ${doc.id}`);
                continue;
              }
              const base64Content = Buffer.from(fileBuffer).toString('base64');
              const fileName = doc.name || doc.storagePath.split('/').pop() || 'document';
              attachments.push({
                content: base64Content,
                filename: fileName,
                type: getMimeType(fileName),
                disposition: 'attachment',
              });
              console.log(`Attached document: ${fileName}`);
            } else {
              console.warn(`Failed to download document ${doc.id}: ${downloadResult.error}`);
            }
          } catch (downloadError) {
            console.warn(`Error downloading document ${doc.id}:`, downloadError);
          }
        }
      }
    }
  } catch (docError) {
    console.warn("Error fetching application documents:", docError);
  }

  const loanSpecifics = application.loanSpecifics as Record<string, any> || {};
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        New Loan Application Submitted
      </h1>
      
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Application Summary</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Application ID:</strong></td>
            <td style="padding: 8px 0;">${application.id}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Loan Type:</strong></td>
            <td style="padding: 8px 0;">${formatLoanType(application.loanType)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Loan Amount:</strong></td>
            <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #2b6cb0;">${formatCurrency(application.loanAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>LTV:</strong></td>
            <td style="padding: 8px 0;">${application.ltv ? `${application.ltv}%` : "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>DSCR:</strong></td>
            <td style="padding: 8px 0;">${application.dscr || "N/A"}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Property Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Property Name:</strong></td>
            <td style="padding: 8px 0;">${application.propertyName || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Address:</strong></td>
            <td style="padding: 8px 0;">${application.propertyAddress || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>City, State:</strong></td>
            <td style="padding: 8px 0;">${application.propertyCity || ""}, ${application.propertyState || ""}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Property Type:</strong></td>
            <td style="padding: 8px 0;">${formatPropertyType(application.propertyType)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Square Footage:</strong></td>
            <td style="padding: 8px 0;">${application.squareFootage ? `${Number(application.squareFootage).toLocaleString()} sq ft` : "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Units:</strong></td>
            <td style="padding: 8px 0;">${application.units || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Year Built:</strong></td>
            <td style="padding: 8px 0;">${application.yearBuilt || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Occupancy:</strong></td>
            <td style="padding: 8px 0;">${application.occupancy ? `${application.occupancy}%` : "N/A"}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Borrower Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Entity Name:</strong></td>
            <td style="padding: 8px 0;">${application.entityName || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Borrower Type:</strong></td>
            <td style="padding: 8px 0;">${application.borrowerType || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Contact Email:</strong></td>
            <td style="padding: 8px 0;">${application.contactEmail || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Contact Phone:</strong></td>
            <td style="padding: 8px 0;">${application.contactPhone || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Years of Experience:</strong></td>
            <td style="padding: 8px 0;">${application.yearsExperience || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Projects Completed:</strong></td>
            <td style="padding: 8px 0;">${application.projectsCompleted || "N/A"}</td>
          </tr>
        </table>
      </div>

      <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Financial Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Net Worth:</strong></td>
            <td style="padding: 8px 0;">${formatCurrency(application.netWorth)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Liquid Assets:</strong></td>
            <td style="padding: 8px 0;">${formatCurrency(application.liquidAssets)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Down Payment Source:</strong></td>
            <td style="padding: 8px 0;">${application.downPaymentSource || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Credit Score:</strong></td>
            <td style="padding: 8px 0;">${application.creditScore || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Annual NOI:</strong></td>
            <td style="padding: 8px 0;">${formatCurrency(application.annualNOI)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;"><strong>Monthly Interest:</strong></td>
            <td style="padding: 8px 0;">${formatCurrency(application.monthlyInterest)}</td>
          </tr>
        </table>
      </div>

      ${loanSpecifics && Object.keys(loanSpecifics).length > 0 ? `
      <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Loan Specifics</h2>
        <table style="width: 100%; border-collapse: collapse;">
          ${loanSpecifics.propertyValue ? `<tr><td style="padding: 8px 0; color: #718096;"><strong>Property Value:</strong></td><td style="padding: 8px 0;">${formatCurrency(loanSpecifics.propertyValue)}</td></tr>` : ""}
          ${loanSpecifics.interestRate ? `<tr><td style="padding: 8px 0; color: #718096;"><strong>Interest Rate:</strong></td><td style="padding: 8px 0;">${loanSpecifics.interestRate}%</td></tr>` : ""}
          ${loanSpecifics.loanTerm ? `<tr><td style="padding: 8px 0; color: #718096;"><strong>Loan Term:</strong></td><td style="padding: 8px 0;">${loanSpecifics.loanTerm} years</td></tr>` : ""}
          ${loanSpecifics.amortization ? `<tr><td style="padding: 8px 0; color: #718096;"><strong>Amortization:</strong></td><td style="padding: 8px 0;">${loanSpecifics.amortization} years</td></tr>` : ""}
          ${loanSpecifics.prepaymentPenalty ? `<tr><td style="padding: 8px 0; color: #718096;"><strong>Prepayment Penalty:</strong></td><td style="padding: 8px 0;">${loanSpecifics.prepaymentPenalty}</td></tr>` : ""}
          ${loanSpecifics.recourse ? `<tr><td style="padding: 8px 0; color: #718096;"><strong>Recourse:</strong></td><td style="padding: 8px 0;">${loanSpecifics.recourse}</td></tr>` : ""}
        </table>
      </div>
      ` : ""}

      ${attachments.length > 0 ? `
      <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">Attached Documents (${attachments.length})</h2>
        <ul style="margin: 0; padding-left: 20px; color: #4a5568;">
          ${attachments.map(att => `<li style="padding: 4px 0;">${att.filename}</li>`).join('')}
        </ul>
      </div>
      ` : ""}

      <div style="margin-top: 30px; padding: 15px; background: #ebf8ff; border-radius: 8px; text-align: center;">
        <p style="margin: 0; color: #2b6cb0;">
          <strong>Submitted:</strong> ${new Date().toLocaleString("en-US", { 
            dateStyle: "full", 
            timeStyle: "short" 
          })}
        </p>
      </div>
    </div>
  `;

  const msg: sgMail.MailDataRequired = {
    to: NOTIFICATION_EMAIL,
    from: SENDER_EMAIL,
    subject: `New Loan Application: ${formatCurrency(application.loanAmount)} - ${application.propertyCity || "Unknown City"}, ${application.propertyState || ""}`,
    html: emailHtml,
    attachments: attachments.length > 0 ? attachments : undefined,
  };

  try {
    await sgMail.send(msg);
    console.log(`Application email sent successfully to ${NOTIFICATION_EMAIL} with ${attachments.length} attachment(s)`);
  } catch (error: any) {
    console.error("SendGrid email error:", error?.response?.body || error.message);
  }
}

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
      
      // Send email notification when application is submitted
      const isBeingSubmitted = validationResult.data.status === "submitted" && application.status !== "submitted";
      if (isBeingSubmitted) {
        await sendApplicationEmail(updated);
      }
      
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
        const { type } = req.body;
        // Use name from body, or fall back to file's original name
        const name = req.body.name || (file ? file.originalname : null);

        if (!type) {
          return res.status(400).json({ message: "Document type is required" });
        }
        if (!name) {
          return res.status(400).json({ message: "Document name is required (provide name field or upload a file)" });
        }

        let storagePath = null;

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

  app.delete("/api/applications/:appId/documents/:docId", isAuthenticated, async (req: any, res) => {
    try {
      // Get document by its own ID, not application ID
      const document = await storage.getDocumentById(req.params.docId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify document belongs to this application
      if (document.applicationId !== req.params.appId) {
        return res.status(403).json({ message: "Document does not belong to this application" });
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

      await storage.deleteDocument(req.params.docId);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
