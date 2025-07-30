export enum LegalEntityType {
  CORPORATION = 'Corporation',
  LLC = 'Limited Liability Company',
  PARTNERSHIP = 'Partnership',
  SUBSIDIARY = 'Subsidiary',
  BRANCH = 'Branch Office',
  DIVISION = 'Division'
}

export enum EntityStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
  SUSPENDED = 'Suspended'
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ContactPerson {
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface LegalEntity {
  id: string;
  name: string;
  type: LegalEntityType;
  registrationNumber: string;
  employeeCount: number;
  status: EntityStatus;
  address: Address;
  contactPerson: ContactPerson;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyInfo {
  id: string;
  name: string;
  description: string;
  industry: string;
  foundedYear: number;
  website: string;
  headquarters: Address;
  createdAt: Date;
  updatedAt: Date;
}
