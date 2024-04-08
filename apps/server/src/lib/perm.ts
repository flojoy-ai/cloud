import WorkspaceRole from "@cloud/shared/src/schemas/public/WorkspaceRole";
import { Permission } from "../types/perm";
import ProjectRole from "@cloud/shared/src/schemas/public/ProjectRole";

export class Perm {
  _permission: Permission;

  constructor(permission: Permission) {
    this._permission = permission;
  }

  canRead(): boolean {
    switch (this._permission) {
      case "read":
      case "write":
      case "admin":
      case "owner":
        return true;
      case "pending":
        return false;
    }
  }

  canWrite(): boolean {
    switch (this._permission) {
      case "pending":
      case "read":
        return false;
      case "write":
      case "admin":
      case "owner":
        return true;
    }
  }
  canAdmin(): boolean {
    switch (this._permission) {
      case "pending":
      case "read":
      case "write":
        return false;
      case "admin":
      case "owner":
        return true;
    }
  }
  isPending(): boolean {
    return this._permission === "pending";
  }
  isOwner(): boolean {
    return this._permission === "owner";
  }
}

export function workspaceRoleToPerm(workspaceRole: WorkspaceRole): Permission {
  switch (workspaceRole) {
    case "owner":
      return "owner" satisfies Permission;

    case "admin":
      return "admin" satisfies Permission;

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
