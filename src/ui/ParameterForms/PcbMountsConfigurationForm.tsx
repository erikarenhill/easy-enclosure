import React from "react";
import { useParams } from "../../lib/params";
import { NumberInput } from "../ParamForm";

export const PcbMountsConfigurationForm = () => {
  const { pcbMounts, pcbMountScrewDiameter, pcbMountXY } = useParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, set: (v: number) => void) => {
    console.log(e.currentTarget.value);
    e.currentTarget.value && set(parseFloat(e.currentTarget.value));
  };

  return (
    <>
      <NumberInput label="PCB Mounts" value={pcbMounts.value} min={0} onChange={(e) => {
        const value = parseFloat(e.currentTarget.value);
        pcbMountXY.set(Array.from({ length: value }, () => [0, 0]));
        pcbMounts.set(value);
      }} />
      {pcbMounts.value > 0 &&
        <NumberInput label="Screw Diameter" value={pcbMountScrewDiameter.value} min={0} onChange={(e) => handleChange(e, pcbMountScrewDiameter.set)} />}

      {pcbMounts.value > 0 &&
        pcbMountXY.map((_, i) => (
          <div key={i}>
            <NumberInput label={`PCB Mount ${i + 1} X`} value={_[0].value} onChange={(e) => handleChange(e, _[0].set)} />
            <NumberInput label={`PCB Mount ${i + 1} Y`} value={_[1].value} onChange={(e) => handleChange(e, _[1].set)} />
          </div>
        ))}
    </>
  );
};
