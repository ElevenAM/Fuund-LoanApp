import { createContext, useContext, useState, useCallback, useMemo } from "react";

export interface RequiredFieldConfig {
  stepId: number;
  fieldName: string;
  dataPath: string;
  label: string;
  condition?: (data: any) => boolean;
}

export interface StepValidationStatus {
  stepId: number;
  missingFields: string[];
  isComplete: boolean;
}

interface FormValidationContextType {
  applicationData: any;
  setApplicationData: (data: any) => void;
  getStepValidation: (stepId: number) => StepValidationStatus;
  getAllStepValidations: () => StepValidationStatus[];
  hasVisitedStep: (stepId: number) => boolean;
  markStepVisited: (stepId: number) => void;
  showValidationErrors: boolean;
  setShowValidationErrors: (show: boolean) => void;
  isFieldMissing: (stepId: number, fieldName: string) => boolean;
}

const requiredFields: RequiredFieldConfig[] = [
  { stepId: 1, fieldName: "loanType", dataPath: "loanType", label: "Loan Type" },
  { stepId: 1, fieldName: "loanAmount", dataPath: "loanAmount", label: "Loan Amount" },
  { stepId: 1, fieldName: "propertyCity", dataPath: "propertyCity", label: "Property City" },
  { stepId: 1, fieldName: "propertyState", dataPath: "propertyState", label: "State" },
  
  { stepId: 2, fieldName: "propertyName", dataPath: "propertyName", label: "Property Name" },
  { stepId: 2, fieldName: "propertyType", dataPath: "propertyType", label: "Property Type" },
  { stepId: 2, fieldName: "entityName", dataPath: "entityName", label: "Entity Name" },
  { stepId: 2, fieldName: "borrowerType", dataPath: "borrowerType", label: "Borrower Type" },
  { stepId: 2, fieldName: "contactEmail", dataPath: "contactEmail", label: "Contact Email" },
  { stepId: 2, fieldName: "contactPhone", dataPath: "contactPhone", label: "Contact Phone" },
  
  { stepId: 3, fieldName: "propertyValue", dataPath: "loanSpecifics.propertyValue", label: "Property Value" },
  { 
    stepId: 3, 
    fieldName: "loanTerm", 
    dataPath: "loanSpecifics.loanTerm", 
    label: "Loan Term",
    condition: (data) => data?.loanType?.includes("permanent") || data?.loanType?.includes("bridge")
  },
  { 
    stepId: 3, 
    fieldName: "amortization", 
    dataPath: "loanSpecifics.amortization", 
    label: "Amortization",
    condition: (data) => data?.loanType?.includes("permanent")
  },
  { 
    stepId: 3, 
    fieldName: "exitStrategy", 
    dataPath: "loanSpecifics.exitStrategy", 
    label: "Exit Strategy",
    condition: (data) => data?.loanType?.includes("bridge")
  },
  { 
    stepId: 3, 
    fieldName: "currentLoanBalance", 
    dataPath: "loanSpecifics.currentLoanBalance", 
    label: "Current Loan Balance",
    condition: (data) => data?.loanType?.includes("refinance")
  },
  { 
    stepId: 3, 
    fieldName: "constructionBudget", 
    dataPath: "loanSpecifics.constructionBudget", 
    label: "Construction Budget",
    condition: (data) => data?.loanType === "construction"
  },
  { 
    stepId: 3, 
    fieldName: "constructionPeriod", 
    dataPath: "loanSpecifics.constructionPeriod", 
    label: "Construction Period",
    condition: (data) => data?.loanType === "construction"
  },
  
  { stepId: 4, fieldName: "netWorth", dataPath: "netWorth", label: "Net Worth" },
  { stepId: 4, fieldName: "liquidAssets", dataPath: "liquidAssets", label: "Liquid Assets" },
  { stepId: 4, fieldName: "downPaymentSource", dataPath: "downPaymentSource", label: "Down Payment Source" },
  
  { 
    stepId: 5, 
    fieldName: "annualGrossIncome", 
    dataPath: "loanSpecifics.annualGrossIncome", 
    label: "Annual Gross Income",
    condition: (data) => {
      const propertyType = data?.propertyType || "";
      const loanType = data?.loanType || "";
      return propertyType !== "land" && propertyType !== "owner-occupied" && loanType !== "construction";
    }
  },
  { 
    stepId: 5, 
    fieldName: "annualOperatingExpenses", 
    dataPath: "loanSpecifics.annualOperatingExpenses", 
    label: "Annual Operating Expenses",
    condition: (data) => {
      const propertyType = data?.propertyType || "";
      const loanType = data?.loanType || "";
      return propertyType !== "land" && propertyType !== "owner-occupied" && loanType !== "construction";
    }
  },
  { 
    stepId: 5, 
    fieldName: "occupancy", 
    dataPath: "occupancy", 
    label: "Occupancy Rate",
    condition: (data) => {
      const propertyType = data?.propertyType || "";
      const loanType = data?.loanType || "";
      return propertyType !== "land" && propertyType !== "owner-occupied" && loanType !== "construction";
    }
  },
];

function getValueByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }
  return value;
}

function isFieldEmpty(value: any): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

export function useFormValidation(data: any) {
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([1]));
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const markStepVisited = useCallback((stepId: number) => {
    setVisitedSteps(prev => new Set(Array.from(prev).concat([stepId])));
  }, []);

  const hasVisitedStep = useCallback((stepId: number) => {
    return visitedSteps.has(stepId);
  }, [visitedSteps]);

  const getStepValidation = useCallback((stepId: number): StepValidationStatus => {
    const stepFields = requiredFields.filter(field => field.stepId === stepId);
    const missingFields: string[] = [];

    for (const field of stepFields) {
      if (field.condition && !field.condition(data)) {
        continue;
      }
      const value = getValueByPath(data, field.dataPath);
      if (isFieldEmpty(value)) {
        missingFields.push(field.fieldName);
      }
    }

    return {
      stepId,
      missingFields,
      isComplete: missingFields.length === 0,
    };
  }, [data]);

  const getAllStepValidations = useCallback((): StepValidationStatus[] => {
    const stepIds = [1, 2, 3, 4, 5];
    return stepIds.map(stepId => getStepValidation(stepId));
  }, [getStepValidation]);

  const isFieldMissing = useCallback((stepId: number, fieldName: string): boolean => {
    if (!showValidationErrors) return false;
    const validation = getStepValidation(stepId);
    return validation.missingFields.includes(fieldName);
  }, [getStepValidation, showValidationErrors]);

  return {
    getStepValidation,
    getAllStepValidations,
    hasVisitedStep,
    markStepVisited,
    showValidationErrors,
    setShowValidationErrors,
    isFieldMissing,
  };
}

export const FormValidationContext = createContext<FormValidationContextType | null>(null);

export function useFormValidationContext() {
  const context = useContext(FormValidationContext);
  if (!context) {
    throw new Error("useFormValidationContext must be used within FormValidationProvider");
  }
  return context;
}
