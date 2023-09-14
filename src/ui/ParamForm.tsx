import React from "react";
import { useParams } from "../lib/params";

import { PcbMountsConfigurationForm, HolesConfigurationForm, BoxGeometryConfigurationForm } from "./ParameterForms";

export const NumberInput = ({label, value, min=undefined, onChange}: {label: string, value: number, min?: number, onChange: (e: React.ChangeEvent<HTMLInputElement| HTMLSelectElement>) => void}) => (
  <div className="input-group">
    <label>{label}</label>
    <input type="number" min={min} value={value} onChange={onChange} />
  </div>
)

const CheckBox = ({label, value, onChange}: {label: string, value: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement| HTMLSelectElement>) => void}) => (
  <div className="input-group">
    <label>{label}</label>
    <input type="checkbox" checked={value} onChange={onChange} />
  </div>
)

export const ParamsForm = () => {
  const { wallMountScrewDiameter, wallMounts, waterProof, screws, screwDiameter, sealThickness } = useParams()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLSelectElement>, set: (v: number) => void) => {
    console.log(e.currentTarget.value)
    e.currentTarget.value && set(parseFloat(e.currentTarget.value))
  }

  
  return (
    <form id="param-form">
      <BoxGeometryConfigurationForm />
      <hr />
      <HolesConfigurationForm />
      <hr />
      <PcbMountsConfigurationForm />
      <hr />
      <div className="input-group">
        <label>Waterproof</label>
        <input type="checkbox" id="waterProof" checked={waterProof.value} onChange={(e) => {
          waterProof.set(e.currentTarget.checked)
          e.currentTarget.checked && screws.set(true)
        }} />
      </div>
      {
        waterProof.value &&
          <NumberInput label="Seal Thickness" value={sealThickness.value} min={1} onChange={(e) => handleChange(e, sealThickness.set)} />
      }
      <hr />
      <div className="input-group">
        <label>Lid Screws</label>
        <input type="checkbox" id="screws" checked={screws.value} onChange={(e) => {
          screws.set(e.currentTarget.checked)
          !e.currentTarget.checked && waterProof.set(false)
        }} />
      </div>
      {
        screws.value &&
          <NumberInput label="Screw Diameter" value={screwDiameter.value} min={1} onChange={(e) => handleChange(e, screwDiameter.set)} />
      }
      <hr />
      <div className="input-group">
        <label>Wall Mounts</label>
        <input type="checkbox" id="wallMounts" checked={wallMounts.value} min={1} onChange={(e) => wallMounts.set(e.currentTarget.checked)} />
      </div>
      {
        wallMounts.value &&
          <NumberInput label="Screw Diameter" value={wallMountScrewDiameter.value} min={1} onChange={(e) => handleChange(e, wallMountScrewDiameter.set)} />
      }
    </form>
  );
};