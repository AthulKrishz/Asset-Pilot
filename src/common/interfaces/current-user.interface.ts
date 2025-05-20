import { Role } from '@common/enums/role.enum';

export interface CurrentUser {
  id: string;
  name: string;
  role: Role;
  companyId?: string;
}
