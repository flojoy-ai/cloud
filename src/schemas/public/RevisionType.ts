// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import { z } from 'zod';

/** Represents the enum public.revision_type */
type RevisionType = 
  | 'init'
  | 'remove'
  | 'add';

export default RevisionType;

/** Zod schema for revision_type */
export const revisionType = z.enum([
  'init',
  'remove',
  'add',
]);;
