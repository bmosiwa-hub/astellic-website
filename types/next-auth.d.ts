import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    mustChangePassword?: boolean;
    totpEnabled?: boolean;
    astelfinAccess?: boolean;
    hpRole?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      mustChangePassword?: boolean;
      totpEnabled?: boolean;
      astelfinAccess?: boolean;
      hpRole?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    mustChangePassword?: boolean;
    totpEnabled?: boolean;
    astelfinAccess?: boolean;
    hpRole?: string | null;
  }
}
