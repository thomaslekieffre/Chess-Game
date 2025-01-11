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
            <NavigationMenuList className="flex items-center gap-8">
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
                  <BadgePlus className="w-4 h-4 mr-2" />
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

              <NavigationMenuItem>
                <Link href="/achievements">
                  <Button variant="ghost">
                    <Trophy className="w-4 h-4 mr-2" />
                    Succès
                  </Button>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <button
                  onClick={toggleFriendPopup}
                  className="flex items-center"
                >
                  <UserPlus className="w-4 h-4" />
                  Amis
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-6">
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

      {isFriendPopupOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border shadow-lg rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Demande d&apos;ami:</h3>
            <Link
              href="/friends"
              className="text-sm text-primary hover:underline"
            >
              Liste d&apos;amis
            </Link>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              className="border border-border bg-background rounded p-2 w-full"
            />
            <button
              onClick={handleAddFriend}
              className="mt-2 bg-primary text-primary-foreground rounded p-2 w-full"
            >
              Envoyer demande
            </button>
          </div>
        </div>
      )}

      {confirmationOpen && friendData && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border shadow-lg rounded-md p-4">
          <h3 className="font-semibold">Confirmer la demande d&apos;ami</h3>
          <CustomImage
            src={friendData.avatar_url}
            alt="Ami"
            width={64}
            height={64}
          />
          <p className="text-foreground">
            Voulez-vous vraiment demander à {friendUsername} d&apos;être ami ?
          </p>
          <div className="flex justify-between mt-4">
            <button
              onClick={sendFriendRequest}
              className="bg-primary text-primary-foreground rounded p-2"
            >
              OUI
            </button>
            <button
              onClick={() => setConfirmationOpen(false)}
              className="bg-secondary text-secondary-foreground rounded p-2"
            >
              NON
            </button>
          </div>
        </div>
      )}

      <FriendRequests />
    </motion.header>
  );
}
