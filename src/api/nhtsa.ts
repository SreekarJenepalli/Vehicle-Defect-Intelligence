import axios from 'axios';
import type { VINDecodeResult, Recall, Complaint } from '../types';

// Use Vite proxy paths to avoid CORS issues in the browser
const VPIC_BASE = '/api/vpic';
const API_BASE = '/api/nhtsa';

// NHTSA API sometimes returns HTTP 400 with a valid empty-results JSON body
// (e.g. for models with special characters like "F-150").
// We treat any response that contains results/Results as success.
const nhtsa = axios.create({
  validateStatus: () => true, // never throw on HTTP status — we inspect body ourselves
});

export async function decodeVIN(vin: string): Promise<VINDecodeResult> {
  const url = `${VPIC_BASE}/DecodeVinValues/${vin.trim()}?format=json`;
  const res = await nhtsa.get(url);
  const r = res.data?.Results?.[0];
  if (!r) throw new Error('INVALID_VIN');

  // NHTSA returns ErrorCode '0' for valid VINs; anything else (or missing Make) = invalid
  const errorCode = r.ErrorCode ? String(r.ErrorCode).split(',')[0].trim() : '0';
  const isValid = errorCode === '0' && r.Make && r.Make.trim() !== '';
  if (!isValid) throw new Error('INVALID_VIN');

  return {
    make: r.Make || '',
    model: r.Model || '',
    modelYear: r.ModelYear || '',
    bodyClass: r.BodyClass || '',
    driveType: r.DriveType || '',
    engineConfiguration: r.EngineConfiguration || '',
    engineCylinders: r.EngineCylinders || '',
    engineDisplacementL: r.DisplacementL ? parseFloat(r.DisplacementL).toFixed(1) : '',
    fuelTypePrimary: r.FuelTypePrimary || '',
    manufacturer: r.Manufacturer || '',
    plantCity: r.PlantCity || '',
    plantCountry: r.PlantCountry || '',
    series: r.Series || '',
    transmissionStyle: r.TransmissionStyle || '',
    vehicleType: r.VehicleType || '',
    vin: vin.trim().toUpperCase(),
    errorCode: r.ErrorCode || '0',
    errorText: r.ErrorText || '',
  };
}

export async function getRecalls(make: string, model: string, year: string): Promise<Recall[]> {
  const url = `${API_BASE}/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
  const res = await nhtsa.get(url);
  return res.data?.results || [];
}

export async function getComplaints(make: string, model: string, year: string): Promise<Complaint[]> {
  const url = `${API_BASE}/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
  const res = await nhtsa.get(url);
  return res.data?.results || [];
}

export async function getMakes(): Promise<string[]> {
  const url = `${VPIC_BASE}/GetAllMakes?format=json`;
  const res = await nhtsa.get(url);
  const results = res.data?.Results || [];
  return results.map((r: { Make_Name: string }) => r.Make_Name).sort();
}

export async function getModels(make: string, year: string): Promise<string[]> {
  const url = `${VPIC_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
  const res = await nhtsa.get(url);
  const results = res.data?.Results || [];
  return results.map((r: { Model_Name: string }) => r.Model_Name).sort();
}
