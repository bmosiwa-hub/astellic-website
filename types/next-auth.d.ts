import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    mustChangePassword?: boolean;
    totpEnabled?: boolean;
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
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    mustChangePassword?: boolean;
    totpEnabled?: boolean;
  }
}
