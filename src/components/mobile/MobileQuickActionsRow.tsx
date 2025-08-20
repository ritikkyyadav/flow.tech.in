import { motion } from 'framer-motion';
import { Send, Wallet2, Landmark, PlusCircle } from 'lucide-react';

interface MobileQuickActionsRowProps {
  onSend?: () => void;
  onRequest?: () => void;
  onLoan?: () => void;
  onTopup?: () => void;
}

const Action = ({ label, icon: Icon, onClick }: { label: string; icon: any; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white border border-gray-200 active:scale-95 transition-all"
  >
    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-orange-500 text-white flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-xs font-medium text-gray-700">{label}</span>
  </button>
);

export const MobileQuickActionsRow = ({ onSend, onRequest, onLoan, onTopup }: MobileQuickActionsRowProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid grid-cols-4 gap-3">
      <Action label="Send" icon={Send} onClick={onSend} />
      <Action label="Request" icon={Wallet2} onClick={onRequest} />
      <Action label="Loan" icon={Landmark} onClick={onLoan} />
      <Action label="Top up" icon={PlusCircle} onClick={onTopup} />
    </motion.div>
  );
};

export default MobileQuickActionsRow;
