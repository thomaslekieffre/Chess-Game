import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

interface GameChatProps {
  className?: string;
}

export function GameChat({ className }: GameChatProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat</h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground text-center">
          Le chat sera disponible en mode multijoueur
        </p>
      </div>

      <div className="p-4 border-t">
        <input
          type="text"
          placeholder="Message..."
          className="w-full bg-muted p-2 rounded-md"
          disabled
        />
      </div>
    </Card>
  );
}
