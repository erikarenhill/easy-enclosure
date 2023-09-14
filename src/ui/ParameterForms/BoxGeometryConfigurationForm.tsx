import React from "react";
import { useParams } from "../../lib/params";
import { NumberInput } from "../ParamForm";

export const BoxGeometryConfigurationForm = () => {
  const { length, width, height, floor, roof, wall, cornerRadius, insertThickness, insertHeight } = useParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, set: (v: number) => void) => {
    console.log(e.currentTarget.value);
    e.currentTarget.value && set(parseFloat(e.currentTarget.value));
  };

  return (
    <>
      <NumberInput label="Length" value={length.value} min={1} onChange={(e) => handleChange(e, length.set)} />
      <NumberInput label="Width" value={width.value} min={1} onChange={(e) => handleChange(e, width.set)} />
      <NumberInput label="Height" value={height.value} min={1} onChange={(e) => handleChange(e, height.set)} />
      <NumberInput label="Floor Thickness" value={floor.value} min={1} onChange={(e) => handleChange(e, floor.set)} />
      <NumberInput label="Wall Thickness" value={wall.value} min={1} onChange={(e) => handleChange(e, wall.set)} />
      <NumberInput label="Lid Thickness" value={roof.value} min={1} onChange={(e) => handleChange(e, roof.set)} />
      <NumberInput label="Insert Thickness" value={insertThickness.value} min={1} onChange={(e) => handleChange(e, insertThickness.set)} />
      <NumberInput label="Insert Height" value={insertHeight.value} min={1} onChange={(e) => handleChange(e, insertHeight.set)} />
      <NumberInput label="Corner Radius" value={cornerRadius.value} min={1} onChange={(e) => handleChange(e, cornerRadius.set)} />
    </>
  );
};
