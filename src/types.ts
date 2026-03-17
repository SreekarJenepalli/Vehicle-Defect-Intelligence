export interface VINDecodeResult {
  make: string;
  model: string;
  modelYear: string;
  bodyClass: string;
  driveType: string;
  engineConfiguration: string;
  engineCylinders: string;
  engineDisplacementL: string;
  fuelTypePrimary: string;
  manufacturer: string;
  plantCity: string;
  plantCountry: string;
  series: string;
  transmissionStyle: string;
  vehicleType: string;
  vin: string;
  errorCode: string;
  errorText: string;
}

export interface Recall {
  NHTSACampaignNumber: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  Notes: string;
  ReportReceivedDate: string;
  Make: string;
  Model: string;
  ModelYear: string;
  PotentialNumberOfUnitsAffected: number;
}

export interface Complaint {
  odiNumber: number;
  manufacturer: string;
  crash: boolean;
  fire: boolean;
  numberOfInjuries: number;
  numberOfDeaths: number;
  dateOfIncident: string;
  dateComplaintFiled: string;
  vin?: string;
  components: string;
  summary: string;
  products: ComplaintProduct[];
}

export interface ComplaintProduct {
  type: string;
  make: string;
  model: string;
  modelYear: string;
}

export interface SearchState {
  make: string;
  model: string;
  year: string;
}
