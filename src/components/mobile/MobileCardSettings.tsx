import { MobileToggle } from './MobileToggle';
import { useState } from 'react';

export const MobileCardSettings = () => {
  const [contactless, setContactless] = useState(true);
  const [online, setOnline] = useState(true);
  const [atm, setAtm] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
      <div className="font-semibold text-gray-900">Card Settings</div>
      <div className="flex items-center justify-between"><span className="text-sm text-gray-700">Contactless Payment</span><MobileToggle checked={contactless} onChange={setContactless} /></div>
      <div className="flex items-center justify-between"><span className="text-sm text-gray-700">Online Payment</span><MobileToggle checked={online} onChange={setOnline} /></div>
      <div className="flex items-center justify-between"><span className="text-sm text-gray-700">ATM Withdraws</span><MobileToggle checked={atm} onChange={setAtm} /></div>
    </div>
  );
};

export default MobileCardSettings;
