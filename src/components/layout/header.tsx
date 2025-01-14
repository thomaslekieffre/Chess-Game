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
import {
  Play,
  BookOpen,
  Trophy,
  Eye,
  Plus,
  Library,
  Vote,
  BadgePlus,
  UserPlus,
  PenLine,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@/components/auth/user-button";
import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase";
import CustomImage from "@/components/CustomImage";
import { FriendRequests } from "@/components/friend-requests/FriendRequests";

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

interface FriendData {
  id: string;
  clerk_id: string;
  avatar_url: string;
}

export function Header() {
  const { user } = useUser();
  const supabase = supabaseClient();
  const isSignedIn = !!user;
  const [isFriendPopupOpen, setFriendPopupOpen] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [friendData, setFriendData] = useState<FriendData | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const toggleFriendPopup = () => {
    setFriendPopupOpen(!isFriendPopupOpen);
  };

  const handleAddFriend = async () => {
    if (!user) return;

    // D'abord récupérer l'ID de l'utilisateur cible
    const { data: targetUser, error: targetError } = await supabase
      .from("users")
      .select("clerk_id")
      .eq("username", friendUsername)
      .single();

    if (targetError || !targetUser) {
      alert("Utilisateur non trouvé.");
      return;
    }

    // Vérifier si une demande d'ami existe déjà dans les deux sens
    const { data: existingRequests, error: requestError } = await supabase
      .from("friend_requests")
      .select("status")
      .or(
        `and(from.eq.${user.id},to.eq.${targetUser.clerk_id}),and(from.eq.${targetUser.clerk_id},to.eq.${user.id})`
      );

    if (existingRequests && existingRequests.length > 0) {
      const request = existingRequests[0];
      if (request.status === "accepted") {
        alert("Vous êtes déjà amis avec cet utilisateur.");
        return;
      }
      if (request.status === "pending") {
        alert("Une demande d'ami est déjà en cours.");
        return;
      }
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, clerk_id, avatar_url")
      .eq("username", friendUsername)
      .single();

    if (error || !data) {
      alert("Utilisateur non trouvé.");
      return;
    }

    setFriendData({
      id: data.id,
      clerk_id: data.clerk_id,
      avatar_url: data.avatar_url,
    });
    setConfirmationOpen(true);
  };

  const sendFriendRequest = async () => {
    if (!friendData) {
      alert("Aucune donnée d'ami disponible.");
      return;
    }

    if (!user) {
      alert("Utilisateur non connecté.");
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("clerk_id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !userData) {
      alert("Erreur lors de la récupération des données utilisateur");
      return;
    }

    const { error } = await supabase.from("friend_requests").insert([
      {
        from: userData.clerk_id,
        to: friendData.clerk_id,
      },
    ]);

    if (error) {
      console.error("Erreur lors de l'envoi de la demande d'ami:", error);
      alert("Erreur lors de l'envoi de la demande d'ami: " + error.message);
    } else {
      alert(`Demande d'ami envoyée à ${friendUsername}`);
      setConfirmationOpen(false);
      setFriendUsername("");
      setFriendData(null);
    }
  };
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-sm border-b border-border"
    >
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-semibold hover:text-primary transition-colors flex items-center gap-2"
          >
            <div className="w-8 h-8">
              <img src="/icon/logo.png" className="fill-current w-6 h-8" />
            </div>
            <span className="font-['Vina_Sans'] text-2xl font-light">
              ChessGame
            </span>
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-4">
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
                  {/* <img src="icon/icon1.svg" className="w-5 h-5 dark:invert" /> */}
                  Jouer
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
                  <div className="grid w-[400px] gap-3 p-4">
                    {playModes.map((mode) => (
                      <NavigationMenuLink
                        key={mode.href}
                        href={isSignedIn ? mode.href : "/sign-in"}
                        className="flex items-center gap-4 p-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:bg-white/40 dark:group-hover:bg-white/40 transition-colors">
                          {mode.icon}
                        </div>
                        <div>
                          <div className="font-medium group-hover:text-white transition-colors ">
                            {mode.title}
                          </div>
                          <div className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                            {mode.description}
                          </div>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
                  <PenLine className="w-4 h-4" />
                  Créer
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
                  <div className="grid w-[400px] gap-3 p-4">
                    {createModes.map((mode) => (
                      <NavigationMenuLink
                        key={mode.href}
                        href={isSignedIn ? mode.href : "/sign-in"}
                        className="flex items-center gap-4 p-3 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:bg-white/40 dark:group-hover:bg-white/40 transition-colors">
                          {mode.icon}
                        </div>
                        <div>
                          <div className="font-medium group-hover:text-white transition-colors">
                            {mode.title}
                          </div>
                          <div className="text-sm text-muted-foreground group-hover:text-white/80 transition-colors">
                            {mode.description}
                          </div>
                        </div>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/learn">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Apprendre
                  </Button>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/watch">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Regarder
                  </Button>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/leaderboard">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Classement
                  </Button>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/friends">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Users2 className="w-4 h-4" />
                    Amis
                  </Button>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </motion.header>
  );
}
