import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    name: string;
    role: string;
    companyId: string;
  };
}
