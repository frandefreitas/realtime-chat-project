import ChatBox from '@/components/ChatBox';
import UserList from '@/components/UserList';

export default function ChatPage() {
  return (
    <main className="grid gap-6 md:grid-cols-[1fr_2fr]">
      <UserList />
      <ChatBox />
    </main>
  );
}
