import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { LegalEntity, CompanyInfo, LegalEntityType, EntityStatus } from '../models/legal-entity.model';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private companyInfo: CompanyInfo = {
    id: '1',
    name: 'TechCorp Solutions',
    description: 'Leading technology solutions provider specializing in enterprise software development and digital transformation.',
    industry: 'Technology',
    foundedYear: 2015,
    website: 'https://techcorp-solutions.com',
    headquarters: {
      street: '123 Innovation Drive',
      city: 'San Francisco',
      postalCode: '94105',
      country: 'United States'
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-12-15')
  };

  private legalEntities: LegalEntity[] = [
    {
      id: '1',
      name: 'TechCorp Solutions Inc.',
      type: LegalEntityType.CORPORATION,
      registrationNumber: 'TC-2015-001',
      employeeCount: 250,
      status: EntityStatus.ACTIVE,
      address: {
        street: '123 Innovation Drive',
        city: 'San Francisco',
        postalCode: '94105',
        country: 'United States'
      },
      contactPerson: {
        name: 'Sarah Johnson',
        position: 'Chief Executive Officer',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1 (555) 123-4567'
      },
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-12-15')
    },
    {
      id: '2',
      name: 'TechCorp Europe Ltd.',
      type: LegalEntityType.SUBSIDIARY,
      registrationNumber: 'TCE-2018-002',
      employeeCount: 85,
      status: EntityStatus.ACTIVE,
      address: {
        street: '45 Tech Park Avenue',
        city: 'London',
        postalCode: 'SW1A 1AA',
        country: 'United Kingdom'
      },
      contactPerson: {
        name: 'James Mitchell',
        position: 'Managing Director',
        email: 'james.mitchell@techcorp-eu.com',
        phone: '+44 20 7123 4567'
      },
      createdAt: new Date('2023-03-20'),
      updatedAt: new Date('2024-11-28')
    },
    {
      id: '3',
      name: 'TechCorp Research Division',
      type: LegalEntityType.DIVISION,
      registrationNumber: 'TCR-2020-003',
      employeeCount: 42,
      status: EntityStatus.ACTIVE,
      address: {
        street: '789 Research Boulevard',
        city: 'Austin',
        postalCode: '78701',
        country: 'United States'
      },
      contactPerson: {
        name: 'Dr. Emily Chen',
        position: 'Head of Research',
        email: 'emily.chen@techcorp.com',
        phone: '+1 (555) 987-6543'
      },
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2024-12-01')
    }
  ];

  constructor() {}

  getCompanyInfo(): Observable<CompanyInfo> {
    return of(this.companyInfo).pipe(delay(800));
  }

  updateCompanyInfo(companyInfo: CompanyInfo): Observable<CompanyInfo> {
    return new Observable(observer => {
      setTimeout(() => {
        this.companyInfo = { ...companyInfo, updatedAt: new Date() };
        observer.next(this.companyInfo);
        observer.complete();
      }, 1200);
    });
  }

  getLegalEntities(): Observable<LegalEntity[]> {
    return of(this.legalEntities).pipe(delay(600));
  }

  addLegalEntity(entityData: Omit<LegalEntity, 'id' | 'createdAt' | 'updatedAt'>): Observable<LegalEntity> {
    return new Observable(observer => {
      setTimeout(() => {
        const newEntity: LegalEntity = {
          ...entityData,
          id: (this.legalEntities.length + 1).toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.legalEntities.push(newEntity);
        observer.next(newEntity);
        observer.complete();
      }, 1500);
    });
  }

  updateLegalEntity(id: string, entityData: Partial<LegalEntity>): Observable<LegalEntity> {
    return new Observable(observer => {
      setTimeout(() => {
        const index = this.legalEntities.findIndex(entity => entity.id === id);
        if (index !== -1) {
          this.legalEntities[index] = {
            ...this.legalEntities[index],
            ...entityData,
            updatedAt: new Date()
          };
          observer.next(this.legalEntities[index]);
          observer.complete();
        } else {
          observer.error(new Error('Legal entity not found'));
        }
      }, 1000);
    });
  }

  deleteLegalEntity(id: string): Observable<void> {
    return new Observable(observer => {
      setTimeout(() => {
        const index = this.legalEntities.findIndex(entity => entity.id === id);
        if (index !== -1) {
          this.legalEntities.splice(index, 1);
          observer.next();
          observer.complete();
        } else {
          observer.error(new Error('Legal entity not found'));
        }
      }, 800);
    });
  }
}
