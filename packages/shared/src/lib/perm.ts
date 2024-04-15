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
    }
  }

  canWrite(): boolean {
    switch (this._permission) {
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
      case "read":
      case "write":
        return false;
      case "admin":
      case "owner":
        return true;
    }
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
  }
}

export function projectRoleToPerm(projectRole: ProjectRole): Permission {
  switch (projectRole) {
    case "operator":
      return "read" satisfies Permission;

    case "developer":
      return "write" satisfies Permission;
  }
}
