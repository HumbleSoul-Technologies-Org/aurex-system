import { DBSchema } from "@/lib/local-store";

export interface Migration {
  fromVersion: string;
  toVersion: string;
  description: string;
  migrate: (db: DBSchema) => DBSchema;
}

const CURRENT_VERSION = "2.1.0";

function migrateToV2(db: DBSchema): DBSchema {
  // Add version field if missing
  if (!db.version) {
    db.version = "1.0.0";
  }

  // Initialize new collections if they don't exist
  if (!db.settings) {
    db.settings = [];
  }
  if (!db["system-settings"]) {
    db["system-settings"] = [];
  }

  // Migrate existing properties to add default propertyType
  db.properties = db.properties.map((property: any) => ({
    ...property,
    propertyType: property.propertyType || "residential",
    // Add default values for new commercial fields
    zoning: property.zoning || "",
    permittedUses: property.permittedUses || [],
    loadingDocks: property.loadingDocks || "",
    ceilingHeight: property.ceilingHeight || "",
    powerCapacity: property.powerCapacity || "",
    environmentalReports: property.environmentalReports || "",
    annualPropertyTaxes: property.annualPropertyTaxes || 0,
    annualInsurance: property.annualInsurance || 0,
    operatingExpenses: property.operatingExpenses || 0,
    appraisedValue: property.appraisedValue || 0,
    lastAppraisalDate: property.lastAppraisalDate || "",
    noi: property.noi || 0,
    capRate: property.capRate || 0,
    // Ensure residential fields exist
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    petPolicy: property.petPolicy || "",
    residentialFeatures: property.residentialFeatures || [],
    commercialFeatures: property.commercialFeatures || [],
  }));

  // Migrate existing tenants to add default tenantType
  db.tenants = db.tenants.map((tenant: any) => ({
    ...tenant,
    tenantType: tenant.tenantType || "residential",
    // Ensure all new fields have defaults
    preferredContactMethod: tenant.preferredContactMethod || "email",
    applicationDate:
      tenant.applicationDate || tenant.createdAt || new Date().toISOString(),
    moveInDate: tenant.moveInDate || tenant.lease_start || "",
    // Residential fields
    dateOfBirth: tenant.dateOfBirth || "",
    employmentInfo: tenant.employmentInfo || "",
    previousAddresses: tenant.previousAddresses || [],
    coSigner: tenant.coSigner || "",
    pets: tenant.pets || "",
    vehicles: tenant.vehicles || "",
    // Commercial fields
    businessInfo: tenant.businessInfo || "",
    businessContacts: tenant.businessContacts || "",
    financialInfo: tenant.financialInfo || "",
    securityDeposit: tenant.securityDeposit || tenant.monthlyRent || 0,
    // Emergency contact fields
    emergencyContactName:
      tenant.emergencyContactName || tenant.emergencyContact || "",
    emergencyContactPhone: tenant.emergencyContactPhone || "",
    emergencyContactEmail: tenant.emergencyContactEmail || "",
  }));

  // Migrate existing transactions to add expenseType
  db.transactions = db.transactions.map((transaction: any) => ({
    ...transaction,
    expenseType: transaction.expenseType || "both",
    currency: transaction.currency || "USD",
    paymentSource: transaction.paymentSource || null,
    scheduledDate: transaction.scheduledDate || "",
    processedDate: transaction.processedDate || "",
    reversed: transaction.reversed || false,
    appliedTo: transaction.appliedTo || [],
    notes: transaction.notes || "",
    // Add commercial expense fields
    tripleNetAllocation: transaction.tripleNetAllocation || "",
    capitalizable: transaction.capitalizable || false,
    depreciationSchedule: transaction.depreciationSchedule || "",
    vendorId: transaction.vendorId || "",
    vendorName: transaction.vendorName || "",
    invoiceNumber: transaction.invoiceNumber || "",
    dueDate: transaction.dueDate || "",
    requiresApproval: transaction.requiresApproval || false,
    approvedBy: transaction.approvedBy || "",
    approvalDate: transaction.approvalDate || "",
    recurring: transaction.recurring || null,
  }));

  // Migrate existing payments to add commercial payment structures
  db.payments = db.payments.map((payment: any) => ({
    ...payment,
    paymentType: payment.paymentType || "rent",
    commercialPaymentDetails: payment.commercialPaymentDetails || null,
    residentialPaymentDetails: payment.residentialPaymentDetails || null,
    paymentPlan: payment.paymentPlan || null,
    autoPay: payment.autoPay || false,
  }));

  // Update version
  db.version = "2.0.0";

  return db;
}

function migrateToV2_1(db: DBSchema): DBSchema {
  db.properties = db.properties.map((property: any) => {
    const units = Array.isArray(property.units) ? property.units : [];

    const normalizedUnits = units.map((unit: any) => {
      if (typeof unit === "string") {
        return {
          unitNumber: unit,
          rent: Number(property.price_per_unit ?? 0),
          unitType: "",
          specifications: [],
        };
      }

      return {
        unitNumber: unit.unitNumber || unit.unit || "",
        rent: Number(unit.rent ?? unit.price ?? property.price_per_unit ?? 0),
        unitType: unit.unitType || unit.type || "",
        specifications: Array.isArray(unit.specifications)
          ? unit.specifications
          : [],
      };
    });

    return {
      ...property,
      units: normalizedUnits,
    };
  });

  db.version = "2.1.0";
  return db;
}

export const migrations: Migration[] = [
  {
    fromVersion: "1.0.0",
    toVersion: "2.0.0",
    description:
      "Add support for commercial properties, enhanced tenant management, and system settings",
    migrate: migrateToV2,
  },
  {
    fromVersion: "2.0.0",
    toVersion: "2.1.0",
    description: "Normalize property unit records to the new object schema",
    migrate: migrateToV2_1,
  },
];

export function getApplicableMigrations(currentVersion: string): Migration[] {
  return migrations.filter(
    (migration) => migration.fromVersion === currentVersion,
  );
}

export function migrateDatabase(db: DBSchema): DBSchema {
  let migratedDb = { ...db };
  let currentVersion = migratedDb.version || "1.0.0";

  while (currentVersion !== CURRENT_VERSION) {
    const applicableMigrations = getApplicableMigrations(currentVersion);

    if (applicableMigrations.length === 0) {
      console.warn(
        `No migrations found for version ${currentVersion}. Stopping migration.`,
      );
      break;
    }

    const migration = applicableMigrations[0];

    try {
      console.log(`Applying migration: ${migration.description}`);
      migratedDb = migration.migrate(migratedDb);
      currentVersion = migratedDb.version || currentVersion;
    } catch (error) {
      console.error(`Migration failed: ${migration.description}`, error);
      throw error;
    }
  }

  return migratedDb;
}
