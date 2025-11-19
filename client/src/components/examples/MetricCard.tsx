import MetricCard from "../MetricCard";

export default function MetricCardExample() {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
      <MetricCard
        label="Loan-to-Value (LTV)"
        value="75.0%"
        tooltip="The ratio of the loan amount to the property value. Lower is better for lenders."
        status="good"
      />
      <MetricCard
        label="Debt Service Coverage (DSCR)"
        value="1.35"
        tooltip="Net operating income divided by annual debt service. Should be above 1.25."
        trend="up"
        status="good"
      />
      <MetricCard
        label="Monthly Interest"
        value="$12,500"
        tooltip="Estimated monthly interest payment based on loan amount and rate."
        status="neutral"
      />
    </div>
  );
}
