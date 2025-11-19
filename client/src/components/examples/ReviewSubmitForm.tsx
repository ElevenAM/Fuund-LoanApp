import ReviewSubmitForm from "../ReviewSubmitForm";

export default function ReviewSubmitFormExample() {
  return (
    <div className="p-8 bg-background min-h-screen">
      <ReviewSubmitForm
        onSubmit={() => console.log("Submit for term sheet")}
        onBack={() => console.log("Back clicked")}
        onEdit={(section) => console.log("Edit section:", section)}
      />
    </div>
  );
}
