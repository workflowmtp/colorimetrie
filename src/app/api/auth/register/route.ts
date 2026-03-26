import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { nom, email, login, password } = await request.json();

    // Validation des champs
    if (!nom || !email || !login || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Vérifier si l'email ou le login existent déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { login },
        ],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "login";
      return NextResponse.json(
        { error: `Ce ${field} est déjà utilisé` },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur avec le rôle par défaut "tech_labo"
    const user = await prisma.user.create({
      data: {
        nom,
        email,
        login,
        passwordHash,
        role: "tech_labo", // Rôle par défaut
        actif: true,
      },
      select: {
        id: true,
        nom: true,
        email: true,
        login: true,
        role: true,
        actif: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Utilisateur créé avec succès",
      user,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'inscription" },
      { status: 500 }
    );
  }
}
