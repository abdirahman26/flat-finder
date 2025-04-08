import * as React from "react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription, 
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { IconSend } from "@tabler/icons-react"; // or from lucide-react
import { z } from "zod";
import { useListingsSubscription } from "@/hooks/useListingsSubscription";
// import messages from "@/app/(main)/admin/complaint_messages.json"
import { complaintSchema } from "./DataTable"; 
import { createClient } from "@/supabase/client";
import { getComplaintMessages, sendComplaintMessage } from "@/app/(auth)/actions";



export function ComplaintCellViewer({ item }: { item: z.infer<typeof complaintSchema> }) {

  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  const [messages, setMessages] = React.useState<any[]>([]);
  useListingsSubscription(); 

  // console.log("complaint id", item.complaint_id);

  const { data: messagesData = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["complaint-messages", item.complaint_id],
    queryFn: () => getComplaintMessages(item.complaint_id),
  });

  const [newMessage, setNewMessage] = React.useState("");
  const queryClient = useQueryClient(); // needed for refreshing messages

  

  // Get current signed-in user's ID
  React.useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.warn("User not logged in or error:", error);
        setCurrentUserId(null);
      } else {
        setCurrentUserId(data.user.id);
      }
    };

    fetchUser();
  }, []);

  // console.log("Current User ID:", currentUserId);
  // console.log("Messages Data:", messagesData);
  const [isOpen, setIsOpen] = React.useState(false);
  

  return (
    <Drawer key={item.complaint_id} direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-muted w-fit px-0 text-left">
          {item.title.length > 20 ? `${item.title.slice(0, 20)}...` : item.title}
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
          <DrawerDescription>{item.users.first_name}</DrawerDescription>
        </DrawerHeader>

        
        <div className="flex flex-col gap-2 px-4 py-2 overflow-y-auto">
          {loadingMessages ? (
            <div className="text-center text-muted-foreground text-sm">Loading messages...</div>
          ) : (
            messagesData.map((msg, idx) => {
              const isAdmin = msg.users?.role?.toLowerCase() === "admin"; // normalize case just in case
              const alignClass = isAdmin ? "justify-start" : "justify-end";
              const bubbleClass = isAdmin
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground";

              return (
                <div key={idx} className={`flex w-full ${alignClass}`}>
                  <div className="flex flex-col max-w-[70%]">
                    <div className={`rounded-xl px-3 py-2 text-sm ${bubbleClass}`}>
                      {msg.message}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 text-right">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DrawerFooter className="border-t border-muted pt-3">
          <form
            className="flex w-full items-center gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newMessage.trim() || !currentUserId) return;

              try {
                await sendComplaintMessage({
                  user_id: currentUserId,
                  complaint_id: item.complaint_id,
                  message: newMessage.trim(),
                });

                setNewMessage(""); // clear input
                queryClient.invalidateQueries({ queryKey: ["complaint-messages", item.complaint_id] }); // refetch messages
              } catch (err) {
                console.error("Failed to send message", err);
              }
            }}
          >
            <Input
              type="text"
              placeholder="Type your message..."
              className="rounded-full px-4"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button type="submit" size="icon" className="rounded-full">
              <IconSend className="w-4 h-4" />
            </Button>
          </form>

          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Done
          </Button>

        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default ComplaintCellViewer;