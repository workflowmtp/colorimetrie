import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { getRolePermissionsFromDB } from "@/lib/permissions";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nom: string;
      email: string;
      role: Role;
      permissions: string[];
    };
  }
  interface User {
    id: string;
    nom: string;
    email: string;
    role: Role;
    permissions: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nom: string;
    email: string;
    role: Role;
    permissions: string[];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "ColorLab Pro",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.actif) return null;

        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        // Charger les permissions dynamiques depuis la DB
        const permissions = await getRolePermissionsFromDB(user.role);

        return {
          id: user.id,
          nom: user.nom,
          email: user.email,
          role: user.role,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nom = user.nom;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        nom: token.nom,
        email: token.email,
        role: token.role,
        permissions: token.permissions ?? [],
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24h
  },
};
