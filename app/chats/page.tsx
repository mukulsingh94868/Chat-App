export const dynamic = 'force-dynamic';

import { getFriendList, getInvitationsList, getUsersList } from "@/actions/authActions";
import ChatRoomArea from "@/components/ChatRoomArea";

const page = async () => {
  const friendListData = await getFriendList();
  const usersListData = await getUsersList();
  const invitationsListData = await getInvitationsList(); // NEW
  return (
    <div>
      <ChatRoomArea
        friendListData={friendListData}
        usersListData={usersListData}
        invitationsListData={invitationsListData}
      />
    </div>
  );
};

export default page;
