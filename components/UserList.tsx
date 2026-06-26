"use client";

type User = {
  _id: string;
  name: string;
  email: string;
};

type Props = {
  users: User[];
  currentUserId: string;
  selectedUserId: string;
  onlineUserIds: string[];
  onSelectUser: (user: User) => void;
};

const UserList = ({
  users,
  currentUserId,
  selectedUserId,
  onlineUserIds,
  onSelectUser,
}: Props) => {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
          People
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Click a user to open private chat
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {users
            .filter((user) => user._id !== currentUserId)
            .map((user) => {
              const isOnline = onlineUserIds.includes(user._id);
              const isSelected = selectedUserId === user._id;

              return (
                <button
                  key={user._id}
                  onClick={() => onSelectUser(user)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-cyan-400/50 bg-cyan-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isOnline ? "bg-emerald-400" : "bg-slate-600"
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default UserList;