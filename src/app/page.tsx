import { Combobox } from "@/components/ui/combobox";
import { SUPPORTED_CONTRACTS } from "@/lib/consts";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <h2 className="text-2xl font-semibold mb-5">Operating With</h2>
      <Combobox options={SUPPORTED_CONTRACTS} itemName="token" />
    </main>
  );
}
