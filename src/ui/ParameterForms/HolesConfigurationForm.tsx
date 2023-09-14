import React from "react";
import { useParams } from "../../lib/params";
import { NumberInput } from "../ParamForm";

export const HolesConfigurationForm = () => {
  const { cableGlands, cableGlandSpecs } = useParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, set: (v: number) => void) => {
    console.log(e.currentTarget.value);
    e.currentTarget.value && set(parseFloat(e.currentTarget.value));
  };

  return (
    <>
      <NumberInput label="Holes" value={cableGlands.value} min={0} onChange={(e) => {
        const value = parseFloat(e.currentTarget.value);
        cableGlandSpecs.set(Array.from({ length: value }, () => [0, 12.5]));
        cableGlands.set(value);
      }} />
      {cableGlands.value > 0 &&
        cableGlandSpecs.map((_, i) => (
          <div key={i}>
            <div className="input-group">
              <label>Hole {i + 1} Wall</label>
              <select value={_[0].value} onChange={(e) => handleChange(e, _[0].set)}>
                <option value={0}>Front</option>
                <option value={1}>Right</option>
                <option value={2}>Back</option>
                <option value={3}>Left</option>
              </select>
            </div>
            <NumberInput label={`Hole ${i + 1} Diameter`} value={_[1].value} onChange={(e) => handleChange(e, _[1].set)} />
          </div>
        ))}
    </>
  );
};
