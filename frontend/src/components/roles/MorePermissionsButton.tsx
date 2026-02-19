import React, { useRef, useState } from 'react';
import Tooltip from '../ui/Tooltip';
import { Permission } from '../../types/role';
import { ChevronDown } from 'lucide-react';

interface Props {
  perms: Permission[];
  extraCount: number;
}

const MorePermissionsButton: React.FC<Props> = ({ perms, extraCount }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center px-2 py-1 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 border border-slate-600 text-xs"
        title={`View ${extraCount} more permissions`}
      >
        +{extraCount} more
        <ChevronDown className="ml-2 w-3 h-3 text-slate-400" />
      </button>

      <div className="relative">
        <Tooltip anchorRef={buttonRef as any} isOpen={open} onClose={() => setOpen(false)}>
          <div className="max-h-48 overflow-auto">
            <ul className="divide-y divide-slate-700">
              {perms.map((p) => (
                <li key={p.id} className="py-2">
                  <div className="text-sm font-medium text-slate-200">{p.resource}:{p.action}</div>
                  {p.description && <div className="text-xs text-slate-400 mt-0.5">{p.description}</div>}
                </li>
              ))}
            </ul>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default MorePermissionsButton;
