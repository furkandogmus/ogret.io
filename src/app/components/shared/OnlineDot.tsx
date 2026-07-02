export function OnlineDot({ online }: { online: boolean }) {
  if (!online) return null;
  return <span className="w-3 h-3 bg-green-500 border-2 border-white rounded-full" />;
}
