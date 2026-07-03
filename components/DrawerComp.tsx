import { sendInvite } from "@/actions/authActions";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type User = {
  _id: string;
  name: string;
  email: string;
};

type PendingInvite = {
  toUserId: string;
};

type Invitation = {
  _id: string;
  fromUserId: User;
  toUserId: User;
  status: string;
};

type InvitationsData = {
  incoming: Invitation[];
  outgoing: Invitation[];
};

type TDrawerComp = {
  title: string;
  usersListData: User[];
  currentUserId: string;
  friendIds?: string[];
  pendingInvites?: PendingInvite[];
  invitations?: InvitationsData;
  onRespondInvite?: (invitationId: string, action: "accept" | "reject") => void;
};

const DrawerComp = ({
  title,
  usersListData,
  currentUserId,
  friendIds = [],
  pendingInvites = [],
  invitations,
  onRespondInvite,
}: TDrawerComp) => {
  const pathName = usePathname(); // Get the current pathname
  const friendIdSet = new Set(friendIds);
  const pendingToIds = new Set(pendingInvites.map((p) => p.toUserId));

  const inviteCandidates = usersListData.filter(
    (u) => u._id !== currentUserId && !friendIdSet.has(u._id),
  );

  const incomingInvitations = invitations?.incoming || [];

  const handleSendInvite = async (toUserId: string) => {
    try {
      const payload = { toUserId };
      const response: any = await sendInvite(payload, pathName);
      console.log("Invite response:", response);
      if (response?.statusCode === 201) {
        toast.success(response?.message || "Invite sent successfully!");
      }
    } catch (error) {
      console.error("Send invite error:", error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="border-white/15 bg-white/5 text-xs font-medium text-slate-50 hover:bg-white/10 hover:text-white sm:text-sm"
        >
          {title}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col border-l border-white/10 bg-slate-950/95 text-white sm:max-w-md"
      >
        <SheetHeader className="px-1">
          <SheetTitle className="text-base font-semibold text-slate-50">
            Invite friends
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-400">
            Invite other registered users and manage your friend invitations.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex-1 overflow-y-auto space-y-5 px-1 pb-4">
          {/* Invite candidates */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              All users
            </p>
            {inviteCandidates.length === 0 ? (
              <p className="text-xs text-slate-500">
                No users available to invite. You may already have pending
                requests or existing friends.
              </p>
            ) : (
              <div className="space-y-2">
                {inviteCandidates.map((user: any) => {
                  const isPending = pendingToIds.has(user._id);

                  return (
                    <div
                      key={user._id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={
                              user?.profileImage ||
                              "https://github.com/shadcn.png"
                            }
                            alt="@shadcn"
                            className="grayscale"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 pr-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {user.name}
                          </p>
                          <p className="truncate text-[11px] text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        disabled={!handleSendInvite || isPending}
                        onClick={() => handleSendInvite?.(user._id)}
                        className="rounded-full bg-cyan-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
                      >
                        {isPending ? "Pending" : "Send invite"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incoming invitations */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Incoming invitations
            </p>
            {incomingInvitations.length === 0 ? (
              <p className="text-xs text-slate-500">
                You have no incoming invitations right now.
              </p>
            ) : (
              <div className="space-y-2">
                {incomingInvitations.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-3 py-2"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {req.fromUserId.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {req.fromUserId.email}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          disabled={!onRespondInvite}
                          onClick={() => onRespondInvite?.(req._id, "accept")}
                          className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed"
                        >
                          Accept
                        </Button>
                        <Button
                          type="button"
                          disabled={!onRespondInvite}
                          onClick={() => onRespondInvite?.(req._id, "reject")}
                          className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-semibold text-slate-950 hover:bg-rose-400 disabled:cursor-not-allowed"
                        >
                          Reject
                        </Button>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DrawerComp;
