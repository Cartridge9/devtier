import { WindowFrame } from "@/components/layout/window-frame";
import { DeveloperList } from "@/components/developer-list";

export default function HomePage() {
  return (
    <WindowFrame title="개발자 목록" icon="🏆">
      <DeveloperList />
    </WindowFrame>
  );
}
