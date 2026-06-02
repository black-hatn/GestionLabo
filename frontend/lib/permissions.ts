/**
 * Système de Permissions Basé sur les Rôles (RBAC)
 * Le SuperAdmin a accès à TOUT et peut tout modifier/supprimer
 */

export type UserRole = "ADMIN" | "RECEPTIONIST" | "COLLECTOR" | "LAB_TECH" | "DOCTOR";

interface Permission {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

interface RolePermissions {
  patients: Permission;
  exams: Permission;
  results: Permission;
  invoices: Permission;
  payments: Permission;
  users: Permission;
  settings: Permission;
  analytics: Permission;
  all: Permission; // Superadmin uniquement
}

const FULL_ACCESS: Permission = {
  read: true,
  create: true,
  update: true,
  delete: true,
};

const ADMIN_PERMISSIONS: RolePermissions = {
  patients: FULL_ACCESS,
  exams: FULL_ACCESS,
  results: FULL_ACCESS,
  invoices: FULL_ACCESS,
  payments: FULL_ACCESS,
  users: FULL_ACCESS,
  settings: FULL_ACCESS,
  analytics: FULL_ACCESS,
  all: FULL_ACCESS,
};

const DOCTOR_PERMISSIONS: RolePermissions = {
  patients: FULL_ACCESS,
  exams: { read: true, create: true, update: true, delete: false },
  results: { read: true, create: true, update: true, delete: false },
  invoices: { read: true, create: false, update: false, delete: false },
  payments: { read: true, create: false, update: false, delete: false },
  users: { read: false, create: false, update: false, delete: false },
  settings: { read: false, create: false, update: false, delete: false },
  analytics: { read: true, create: false, update: false, delete: false },
  all: { read: false, create: false, update: false, delete: false },
};

const LAB_TECH_PERMISSIONS: RolePermissions = {
  patients: { read: true, create: false, update: false, delete: false },
  exams: { read: true, create: false, update: false, delete: false },
  results: { read: true, create: true, update: true, delete: false },
  invoices: { read: true, create: false, update: false, delete: false },
  payments: { read: true, create: false, update: false, delete: false },
  users: { read: false, create: false, update: false, delete: false },
  settings: { read: false, create: false, update: false, delete: false },
  analytics: { read: true, create: false, update: false, delete: false },
  all: { read: false, create: false, update: false, delete: false },
};

const RECEPTIONIST_PERMISSIONS: RolePermissions = {
  patients: { read: true, create: true, update: true, delete: false },
  exams: { read: true, create: false, update: false, delete: false },
  results: { read: true, create: false, update: false, delete: false },
  invoices: { read: true, create: true, update: true, delete: false },
  payments: { read: true, create: true, update: false, delete: false },
  users: { read: false, create: false, update: false, delete: false },
  settings: { read: false, create: false, update: false, delete: false },
  analytics: { read: false, create: false, update: false, delete: false },
  all: { read: false, create: false, update: false, delete: false },
};

const COLLECTOR_PERMISSIONS: RolePermissions = {
  patients: { read: true, create: false, update: false, delete: false },
  exams: { read: true, create: false, update: false, delete: false },
  results: { read: true, create: false, update: false, delete: false },
  invoices: { read: false, create: false, update: false, delete: false },
  payments: { read: false, create: false, update: false, delete: false },
  users: { read: false, create: false, update: false, delete: false },
  settings: { read: false, create: false, update: false, delete: false },
  analytics: { read: false, create: false, update: false, delete: false },
  all: { read: false, create: false, update: false, delete: false },
};

const PERMISSIONS_MAP: Record<UserRole, RolePermissions> = {
  ADMIN:        ADMIN_PERMISSIONS,
  RECEPTIONIST: RECEPTIONIST_PERMISSIONS,
  COLLECTOR:    COLLECTOR_PERMISSIONS,
  LAB_TECH:     LAB_TECH_PERMISSIONS,
  DOCTOR:       DOCTOR_PERMISSIONS,
};

const NO_ACCESS: RolePermissions = {
  patients: { read: false, create: false, update: false, delete: false },
  exams: { read: false, create: false, update: false, delete: false },
  results: { read: false, create: false, update: false, delete: false },
  invoices: { read: false, create: false, update: false, delete: false },
  payments: { read: false, create: false, update: false, delete: false },
  users: { read: false, create: false, update: false, delete: false },
  settings: { read: false, create: false, update: false, delete: false },
  analytics: { read: false, create: false, update: false, delete: false },
  all: { read: false, create: false, update: false, delete: false },
};

export function getPermissions(role: UserRole): RolePermissions {
  return PERMISSIONS_MAP[role] ?? NO_ACCESS;
}

export function canAccess(role: UserRole, resource: keyof RolePermissions, action: keyof Permission): boolean {
  const permissions = getPermissions(role);
  const resourcePermissions = permissions[resource];
  return resourcePermissions?.[action] ?? false;
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    ADMIN:        "🔐 Administrateur",
    RECEPTIONIST: "🗂️ Réceptionniste",
    COLLECTOR:    "🩸 Préleveur",
    LAB_TECH:     "🧪 Technicien Labo",
    DOCTOR:       "👨‍⚕️ Médecin",
  };
  return labels[role] || role;
}
