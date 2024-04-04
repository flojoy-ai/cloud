import WorkspaceRole from "@cloud/shared/src/schemas/public/WorkspaceRole";
import { Permission } from "../types/perm";
import ProjectRole from "@cloud/shared/src/schemas/public/ProjectRole";

export function canRead(perm: Permission): boolean {
  switch (perm) {
    case "read":
    case "write":
    case "admin":
      return true;
    case "pending":
      return false;
  }
}

export function canWrite(perm: Permission): boolean {
  switch (perm) {
    case "pending":
    case "read":
      return false;
    case "write":
    case "admin":
      return true;
  }
}

export function canAdmin(perm: Permission): boolean {
  switch (perm) {
    case "pending":
    case "read":
    case "write":
      return false;
    case "admin":
      return true;
  }
}

export function workspaceRoleToPerm(workspaceRole: WorkspaceRole): Permission {
  switch (workspaceRole) {
    case "admin":
      return "admin" satisfies Permission;

    case "owner":
      return "write" satisfies Permission;

    case "member":
      return "read" satisfies Permission;

    case "pending":
      return "pending" satisfies Permission;
  }
}

export function projectRoleToPerm(projectRole: ProjectRole): Permission {
  switch (projectRole) {
    case "test":
      return "read" satisfies Permission;

    case "dev":
      return "write" satisfies Permission;

    case "pending":
      return "pending" satisfies Permission;
  }
}
