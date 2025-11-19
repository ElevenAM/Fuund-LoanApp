import PropertyBasicsForm from "../PropertyBasicsForm";

export default function PropertyBasicsFormExample() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <PropertyBasicsForm
        onContinue={(data) => console.log("Continue clicked:", data)}
        onBack={() => console.log("Back clicked")}
      />
    </div>
  );
}
