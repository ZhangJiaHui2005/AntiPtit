import { Button } from "@/components/ui/button";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <Show when={"signed-in"}>
        <UserButton />
      </Show>

      <Show when={"signed-out"}>
        <SignInButton />
      </Show>
    </div>
  );
}
