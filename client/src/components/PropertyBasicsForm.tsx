import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyBasicsFormProps {
  onContinue?: (data: any) => void;
  onBack?: () => void;
  initialData?: any;
  showValidation?: boolean;
}

export default function PropertyBasicsForm({ onContinue, onBack, initialData, showValidation }: PropertyBasicsFormProps) {
  const [formData, setFormData] = useState({
    propertyName: initialData?.propertyName || "",
    propertyAddress: initialData?.propertyAddress || "",
    propertyType: initialData?.propertyType || "",
    squareFootage: initialData?.squareFootage || "",
    units: initialData?.units || "",
    yearBuilt: initialData?.yearBuilt || "",
    occupancy: initialData?.occupancy || "",
    entityName: initialData?.entityName || "",
    borrowerType: initialData?.borrowerType || "",
    contactEmail: initialData?.contactEmail || "",
    contactPhone: initialData?.contactPhone || "",
    experience: initialData?.yearsExperience || "",
    projectsCompleted: initialData?.projectsCompleted || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      propertyName: formData.propertyName,
      propertyAddress: formData.propertyAddress,
      propertyType: formData.propertyType,
      squareFootage: formData.squareFootage,
      units: formData.units,
      yearBuilt: formData.yearBuilt,
      occupancy: formData.occupancy,
      entityName: formData.entityName,
      borrowerType: formData.borrowerType,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      yearsExperience: formData.experience,
      projectsCompleted: formData.projectsCompleted,
    };
    console.log("Property Basics submitted:", data);
    onContinue?.(data);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6"
        data-testid="button-back"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back
      </Button>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2" data-testid="text-heading">
          Property & Borrower Details
        </h2>
        <p className="text-muted-foreground" data-testid="text-subheading">
          Tell us about the property and who's applying
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-6">Property Information</h3>
          <div className="space-y-6">
            <div>
              <Label htmlFor="property-name">
                Property Name/Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property-name"
                value={formData.propertyName}
                onChange={(e) => updateField("propertyName", e.target.value)}
                placeholder="123 Main Street, Suite 100"
                className={cn("mt-2", showValidation && !formData.propertyName && "border-destructive")}
                data-testid="input-property-name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property-type">
                  Property Type <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.propertyType} onValueChange={(val) => updateField("propertyType", val)}>
                  <SelectTrigger className={cn("mt-2", showValidation && !formData.propertyType && "border-destructive")} data-testid="select-property-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multifamily">Multifamily</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="mixed-use">Mixed-Use</SelectItem>
                    <SelectItem value="self-storage">Self-Storage</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="square-footage">Square Footage / Units</Label>
                <Input
                  id="square-footage"
                  value={formData.squareFootage}
                  onChange={(e) => updateField("squareFootage", e.target.value)}
                  placeholder="50,000 SF or 100 units"
                  className="mt-2"
                  data-testid="input-square-footage"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year-built">Year Built</Label>
                <Input
                  id="year-built"
                  value={formData.yearBuilt}
                  onChange={(e) => updateField("yearBuilt", e.target.value)}
                  placeholder="2015"
                  className="mt-2"
                  data-testid="input-year-built"
                />
              </div>

              <div>
                <Label htmlFor="occupancy">Current Occupancy %</Label>
                <div className="relative mt-2">
                  <Input
                    id="occupancy"
                    value={formData.occupancy}
                    onChange={(e) => updateField("occupancy", e.target.value)}
                    placeholder="95"
                    data-testid="input-occupancy"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-6">Borrower Information</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entity-name">
                  Entity Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="entity-name"
                  value={formData.entityName}
                  onChange={(e) => updateField("entityName", e.target.value)}
                  placeholder="ABC Properties LLC"
                  className={cn("mt-2", showValidation && !formData.entityName && "border-destructive")}
                  data-testid="input-entity-name"
                />
              </div>

              <div>
                <Label htmlFor="borrower-type">
                  Borrower Type <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.borrowerType} onValueChange={(val) => updateField("borrowerType", val)}>
                  <SelectTrigger className={cn("mt-2", showValidation && !formData.borrowerType && "border-destructive")} data-testid="select-borrower-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="trust">Trust</SelectItem>
                    <SelectItem value="foreign-national">Foreign National</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-email">
                  Contact Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  placeholder="john@example.com"
                  className={cn("mt-2", showValidation && !formData.contactEmail && "border-destructive")}
                  data-testid="input-contact-email"
                />
              </div>

              <div>
                <Label htmlFor="contact-phone">
                  Contact Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => updateField("contactPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className={cn("mt-2", showValidation && !formData.contactPhone && "border-destructive")}
                  data-testid="input-contact-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Years of RE Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => updateField("experience", e.target.value)}
                  placeholder="10"
                  className="mt-2"
                  data-testid="input-experience"
                />
              </div>

              <div>
                <Label htmlFor="projects-completed">Similar Projects Completed</Label>
                <Input
                  id="projects-completed"
                  value={formData.projectsCompleted}
                  onChange={(e) => updateField("projectsCompleted", e.target.value)}
                  placeholder="5"
                  className="mt-2"
                  data-testid="input-projects-completed"
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} type="button" data-testid="button-back-bottom">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button type="submit" size="lg" className="h-12 px-8" data-testid="button-continue">
            Continue to Loan Specifics
          </Button>
        </div>
      </form>
    </div>
  );
}
