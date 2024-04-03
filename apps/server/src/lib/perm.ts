import { Permission } from "../types/perm";

export function canRead(perm: Permission): boolean {
  switch (perm) {
    case "read":
    case "write":
    case "admin":
      return true;
  }
}

export function canWrite(perm: Permission): boolean {
  switch (perm) {
    case "read":
      return false;
    case "write":
    case "admin":
      return true;
  }
}

export function canAdmin(perm: Permission): boolean {
  switch (perm) {
    case "read":
    case "write":
      return false;
    case "admin":
      return true;
  }
}
