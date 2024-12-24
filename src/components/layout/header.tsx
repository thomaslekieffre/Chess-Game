"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { motion } from "framer-motion";
import { Play, BookOpen, Trophy, Eye, Plus, Library, Vote } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@/components/auth/user-button";

const playModes = [
  {
    title: "Mode Classique",
    description: "Jouez aux échecs traditionnels",
    icon: <Play className="w-4 h-4" />,
    href: "/play/classic",
  },
  {
    title: "Mode Personnalisé",
    description: "Utilisez vos propres pièces",
    icon: <Play className="w-4 h-4" />,
    href: "/play/custom",
  },
  {
    title: "Mode Compétitif",
    description: "Affrontez les meilleurs joueurs",
    icon: <Trophy className="w-4 h-4" />,
    href: "/play/ranked",
  },
];

const createModes = [
  {
    title: "Créer une pièce",
    description: "Concevez vos propres pièces d'échecs",
    icon: <Plus className="w-4 h-4" />,
    href: "/create",
  },
  {
    title: "Mes pièces",
    description: "Gérez vos créations personnelles",
    icon: <Library className="w-4 h-4" />,
    href: "/my-pieces",
  },
  {
    title: "Pièces publiques",
    description: "Votez pour les créations de la communauté",
    icon: <Vote className="w-4 h-4" />,
    href: "/public-pieces",
  },
];

export function Header() {
  const { isSignedIn } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold hover:text-primary transition-colors"
          >
            ChessGame
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-16">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-lg hover:text-primary transition-colors">
                  Jouer
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background dark:bg-background/80">
                  <div className="grid w-[400px] gap-3 p-4">
                    {playModes.map((mode) => (
                      <NavigationMenuLink
                        key={mode.href}
                        href={isSignedIn ? mode.href : "/sign-in"}
                        className="flex items-center gap-4 p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          {mode.icon}
                        </div>
                        <div>
                          <div className="font-medium">{mode.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {mode.description}
                          </div>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-lg hover:text-primary transition-colors">
                  Créer
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background dark:bg-background/80">
                  <div className="grid w-[400px] gap-3 p-4">
                    {createModes.map((mode) => (
                      <NavigationMenuLink
                        key={mode.href}
                        href={isSignedIn ? mode.href : "/sign-in"}
                        className="flex items-center gap-4 p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          {mode.icon}
                        </div>
                        <div>
                          <div className="font-medium">{mode.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {mode.description}
                          </div>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  href={isSignedIn ? "/learn" : "/sign-in"}
                  legacyBehavior
                  passHref
                >
                  <NavigationMenuLink className="flex items-center gap-2 hover:text-primary transition-colors">
                    <BookOpen className="w-4 h-4" />
                    Apprendre
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/watch" legacyBehavior passHref>
                  <NavigationMenuLink className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Eye className="w-4 h-4" />
                    Regarder
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/leaderboard" legacyBehavior passHref>
                  <NavigationMenuLink className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Trophy className="w-4 h-4" />
                    Classement
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <Button asChild>
              <Link href="/sign-in">Se connecter</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
