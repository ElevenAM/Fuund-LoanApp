import LoanTypeCard from "../LoanTypeCard";
import buildingIcon from "@assets/generated_images/Permanent_acquisition_building_icon_c15f24a8.png";

export default function LoanTypeCardExample() {
  return (
    <div className="p-8 max-w-xs">
      <LoanTypeCard
        value="permanent-acquisition"
        title="Permanent Acquisition"
        description="Long-term financing for property purchase"
        icon={buildingIcon}
        selected={true}
      />
    </div>
  );
}
